'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _fulcrumDesktopPlugin = require('fulcrum-desktop-plugin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_mkdirp2.default.sync(_path2.default.join(__dirname, 'tmp'));

exports.default = class {
  constructor() {
    var _this = this;

    this.runCommand = _asyncToGenerator(function* () {
      // await this.activate();

      const account = yield fulcrum.fetchAccount(fulcrum.args.org);

      if (account) {
        // do something
      } else {
        console.error('Unable to find account', fulcrum.args.org);
      }
    });

    this.handlePhotoSave = (() => {
      var _ref2 = _asyncToGenerator(function* ({ account, photo }) {
        const downloadURL = _fulcrumDesktopPlugin.APIClient.getPhotoURL(account, photo);

        yield _this.uploadFile(account, photo, downloadURL, `photos/${photo.id}.jpg`);
      });

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    })();

    this.handleVideoSave = (() => {
      var _ref3 = _asyncToGenerator(function* ({ account, video }) {
        const downloadURL = _fulcrumDesktopPlugin.APIClient.getVideoURL(account, video);

        yield _this.uploadFile(account, video, downloadURL, `videos/${video.id}.mp4`);
      });

      return function (_x2) {
        return _ref3.apply(this, arguments);
      };
    })();

    this.handleAudioSave = (() => {
      var _ref4 = _asyncToGenerator(function* ({ account, audio }) {
        const downloadURL = _fulcrumDesktopPlugin.APIClient.getAudioURL(account, audio);

        yield _this.uploadFile(account, audio, downloadURL, `audio/${audio.id}.m4a`);
      });

      return function (_x3) {
        return _ref4.apply(this, arguments);
      };
    })();

    this.handleSignatureSave = (() => {
      var _ref5 = _asyncToGenerator(function* ({ account, signature }) {
        const downloadURL = _fulcrumDesktopPlugin.APIClient.getSignatureURL(account, signature);

        yield _this.uploadFile(account, signature, downloadURL, `signatures/${signature.id}.png`);
      });

      return function (_x4) {
        return _ref5.apply(this, arguments);
      };
    })();
  }

  task(cli) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      return cli.command({
        command: 's3',
        desc: 'sync media for an organization to S3',
        builder: {
          org: {
            desc: 'organization name',
            required: true,
            type: 'string'
          },
          s3AccessKeyId: {
            desc: 'S3 access key id',
            type: 'string'
          },
          s3SecretAccessKey: {
            desc: 'S3 secret access key',
            type: 'string'
          },
          s3Bucket: {
            desc: 'S3 bucket',
            type: 'string'
          }
        },
        handler: _this2.runCommand
      });
    })();
  }

  activate() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      _awsSdk2.default.config.update({
        accessKeyId: fulcrum.args.s3AccessKeyId || process.env.S3_ACCESS_KEY,
        secretAccessKey: fulcrum.args.s3SecretAccessKey || process.env.S3_ACCESS_SECRET
      });

      _this3.s3 = new _awsSdk2.default.S3();

      fulcrum.on('photo:save', _this3.handlePhotoSave);
      fulcrum.on('video:save', _this3.handleVideoSave);
      fulcrum.on('audio:save', _this3.handleAudioSave);
      fulcrum.on('signature:save', _this3.handleSignatureSave);
    })();
  }

  tempPath(media) {
    return _path2.default.join(__dirname, 'tmp', media.id);
  }

  uploadFile(account, media, url, name) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const tempFile = _this4.tempPath(media);

      yield _fulcrumDesktopPlugin.APIClient.download(url, tempFile);

      return new Promise(function (resolve, reject) {
        _this4.s3.putObject({
          Bucket: fulcrum.args.s3Bucket || process.env.S3_BUCKET,
          Key: name,
          Body: _fs2.default.createReadStream(tempFile),
          ACL: 'public-read'
        }, function (res) {
          _rimraf2.default.sync(tempFile);

          resolve();
        });
      });
    })();
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3BsdWdpbi5qcyJdLCJuYW1lcyI6WyJzeW5jIiwiam9pbiIsIl9fZGlybmFtZSIsInJ1bkNvbW1hbmQiLCJhY2NvdW50IiwiZnVsY3J1bSIsImZldGNoQWNjb3VudCIsImFyZ3MiLCJvcmciLCJjb25zb2xlIiwiZXJyb3IiLCJoYW5kbGVQaG90b1NhdmUiLCJwaG90byIsImRvd25sb2FkVVJMIiwiZ2V0UGhvdG9VUkwiLCJ1cGxvYWRGaWxlIiwiaWQiLCJoYW5kbGVWaWRlb1NhdmUiLCJ2aWRlbyIsImdldFZpZGVvVVJMIiwiaGFuZGxlQXVkaW9TYXZlIiwiYXVkaW8iLCJnZXRBdWRpb1VSTCIsImhhbmRsZVNpZ25hdHVyZVNhdmUiLCJzaWduYXR1cmUiLCJnZXRTaWduYXR1cmVVUkwiLCJ0YXNrIiwiY2xpIiwiY29tbWFuZCIsImRlc2MiLCJidWlsZGVyIiwicmVxdWlyZWQiLCJ0eXBlIiwiczNBY2Nlc3NLZXlJZCIsInMzU2VjcmV0QWNjZXNzS2V5IiwiczNCdWNrZXQiLCJoYW5kbGVyIiwiYWN0aXZhdGUiLCJjb25maWciLCJ1cGRhdGUiLCJhY2Nlc3NLZXlJZCIsInByb2Nlc3MiLCJlbnYiLCJTM19BQ0NFU1NfS0VZIiwic2VjcmV0QWNjZXNzS2V5IiwiUzNfQUNDRVNTX1NFQ1JFVCIsInMzIiwiUzMiLCJvbiIsInRlbXBQYXRoIiwibWVkaWEiLCJ1cmwiLCJuYW1lIiwidGVtcEZpbGUiLCJkb3dubG9hZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicHV0T2JqZWN0IiwiQnVja2V0IiwiUzNfQlVDS0VUIiwiS2V5IiwiQm9keSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJBQ0wiLCJyZXMiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsaUJBQU9BLElBQVAsQ0FBWSxlQUFLQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsS0FBckIsQ0FBWjs7a0JBRWUsTUFB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QUFPakUsSUFBUCxDQUFZcUQsUUFBWjs7QUFFQUc7QUFDRCxTQVREO0FBVUQsT0FYTSxDQUFQO0FBTDBDO0FBaUIzQztBQW5Ha0IsQyIsImZpbGUiOiJwbHVnaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IHsgQVBJQ2xpZW50IH0gZnJvbSAnZnVsY3J1bSc7XG5cbm1rZGlycC5zeW5jKHBhdGguam9pbihfX2Rpcm5hbWUsICd0bXAnKSk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcbiAgYXN5bmMgdGFzayhjbGkpIHtcbiAgICByZXR1cm4gY2xpLmNvbW1hbmQoe1xuICAgICAgY29tbWFuZDogJ3MzJyxcbiAgICAgIGRlc2M6ICdzeW5jIG1lZGlhIGZvciBhbiBvcmdhbml6YXRpb24gdG8gUzMnLFxuICAgICAgYnVpbGRlcjoge1xuICAgICAgICBvcmc6IHtcbiAgICAgICAgICBkZXNjOiAnb3JnYW5pemF0aW9uIG5hbWUnLFxuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIHMzQWNjZXNzS2V5SWQ6IHtcbiAgICAgICAgICBkZXNjOiAnUzMgYWNjZXNzIGtleSBpZCcsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfSxcbiAgICAgICAgczNTZWNyZXRBY2Nlc3NLZXk6IHtcbiAgICAgICAgICBkZXNjOiAnUzMgc2VjcmV0IGFjY2VzcyBrZXknLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgIH0sXG4gICAgICAgIHMzQnVja2V0OiB7XG4gICAgICAgICAgZGVzYzogJ1MzIGJ1Y2tldCcsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGhhbmRsZXI6IHRoaXMucnVuQ29tbWFuZFxuICAgIH0pO1xuICB9XG5cbiAgcnVuQ29tbWFuZCA9IGFzeW5jICgpID0+IHtcbiAgICAvLyBhd2FpdCB0aGlzLmFjdGl2YXRlKCk7XG5cbiAgICBjb25zdCBhY2NvdW50ID0gYXdhaXQgZnVsY3J1bS5mZXRjaEFjY291bnQoZnVsY3J1bS5hcmdzLm9yZyk7XG5cbiAgICBpZiAoYWNjb3VudCkge1xuICAgICAgLy8gZG8gc29tZXRoaW5nXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byBmaW5kIGFjY291bnQnLCBmdWxjcnVtLmFyZ3Mub3JnKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBhY3RpdmF0ZSgpIHtcbiAgICBBV1MuY29uZmlnLnVwZGF0ZSh7XG4gICAgICBhY2Nlc3NLZXlJZDogZnVsY3J1bS5hcmdzLnMzQWNjZXNzS2V5SWQgfHwgcHJvY2Vzcy5lbnYuUzNfQUNDRVNTX0tFWSxcbiAgICAgIHNlY3JldEFjY2Vzc0tleTogZnVsY3J1bS5hcmdzLnMzU2VjcmV0QWNjZXNzS2V5IHx8IHByb2Nlc3MuZW52LlMzX0FDQ0VTU19TRUNSRVRcbiAgICB9KTtcblxuICAgIHRoaXMuczMgPSBuZXcgQVdTLlMzKCk7XG5cbiAgICBmdWxjcnVtLm9uKCdwaG90bzpzYXZlJywgdGhpcy5oYW5kbGVQaG90b1NhdmUpO1xuICAgIGZ1bGNydW0ub24oJ3ZpZGVvOnNhdmUnLCB0aGlzLmhhbmRsZVZpZGVvU2F2ZSk7XG4gICAgZnVsY3J1bS5vbignYXVkaW86c2F2ZScsIHRoaXMuaGFuZGxlQXVkaW9TYXZlKTtcbiAgICBmdWxjcnVtLm9uKCdzaWduYXR1cmU6c2F2ZScsIHRoaXMuaGFuZGxlU2lnbmF0dXJlU2F2ZSk7XG4gIH1cblxuICB0ZW1wUGF0aChtZWRpYSkge1xuICAgIHJldHVybiBwYXRoLmpvaW4oX19kaXJuYW1lLCAndG1wJywgbWVkaWEuaWQpO1xuICB9XG5cbiAgaGFuZGxlUGhvdG9TYXZlID0gYXN5bmMgKHthY2NvdW50LCBwaG90b30pID0+IHtcbiAgICBjb25zdCBkb3dubG9hZFVSTCA9IEFQSUNsaWVudC5nZXRQaG90b1VSTChhY2NvdW50LCBwaG90byk7XG5cbiAgICBhd2FpdCB0aGlzLnVwbG9hZEZpbGUoYWNjb3VudCwgcGhvdG8sIGRvd25sb2FkVVJMLCBgcGhvdG9zLyR7cGhvdG8uaWR9LmpwZ2ApO1xuICB9XG5cbiAgaGFuZGxlVmlkZW9TYXZlID0gYXN5bmMgKHthY2NvdW50LCB2aWRlb30pID0+IHtcbiAgICBjb25zdCBkb3dubG9hZFVSTCA9IEFQSUNsaWVudC5nZXRWaWRlb1VSTChhY2NvdW50LCB2aWRlbyk7XG5cbiAgICBhd2FpdCB0aGlzLnVwbG9hZEZpbGUoYWNjb3VudCwgdmlkZW8sIGRvd25sb2FkVVJMLCBgdmlkZW9zLyR7dmlkZW8uaWR9Lm1wNGApO1xuICB9XG5cbiAgaGFuZGxlQXVkaW9TYXZlID0gYXN5bmMgKHthY2NvdW50LCBhdWRpb30pID0+IHtcbiAgICBjb25zdCBkb3dubG9hZFVSTCA9IEFQSUNsaWVudC5nZXRBdWRpb1VSTChhY2NvdW50LCBhdWRpbyk7XG5cbiAgICBhd2FpdCB0aGlzLnVwbG9hZEZpbGUoYWNjb3VudCwgYXVkaW8sIGRvd25sb2FkVVJMLCBgYXVkaW8vJHthdWRpby5pZH0ubTRhYCk7XG4gIH1cblxuICBoYW5kbGVTaWduYXR1cmVTYXZlID0gYXN5bmMgKHthY2NvdW50LCBzaWduYXR1cmV9KSA9PiB7XG4gICAgY29uc3QgZG93bmxvYWRVUkwgPSBBUElDbGllbnQuZ2V0U2lnbmF0dXJlVVJMKGFjY291bnQsIHNpZ25hdHVyZSk7XG5cbiAgICBhd2FpdCB0aGlzLnVwbG9hZEZpbGUoYWNjb3VudCwgc2lnbmF0dXJlLCBkb3dubG9hZFVSTCwgYHNpZ25hdHVyZXMvJHtzaWduYXR1cmUuaWR9LnBuZ2ApO1xuICB9XG5cbiAgYXN5bmMgdXBsb2FkRmlsZShhY2NvdW50LCBtZWRpYSwgdXJsLCBuYW1lKSB7XG4gICAgY29uc3QgdGVtcEZpbGUgPSB0aGlzLnRlbXBQYXRoKG1lZGlhKTtcblxuICAgIGF3YWl0IEFQSUNsaWVudC5kb3dubG9hZCh1cmwsIHRlbXBGaWxlKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnMzLnB1dE9iamVjdCh7XG4gICAgICAgIEJ1Y2tldDogZnVsY3J1bS5hcmdzLnMzQnVja2V0IHx8IHByb2Nlc3MuZW52LlMzX0JVQ0tFVCxcbiAgICAgICAgS2V5OiBuYW1lLFxuICAgICAgICBCb2R5OiBmcy5jcmVhdGVSZWFkU3RyZWFtKHRlbXBGaWxlKSxcbiAgICAgICAgQUNMOiAncHVibGljLXJlYWQnXG4gICAgICB9LCAocmVzKSA9PiB7XG4gICAgICAgIHJpbXJhZi5zeW5jKHRlbXBGaWxlKTtcblxuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19