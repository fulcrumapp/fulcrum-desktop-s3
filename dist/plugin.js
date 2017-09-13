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

_awsSdk2.default.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET
});

const s3 = new _awsSdk2.default.S3();

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
          }
        },
        handler: _this2.runCommand
      });
    })();
  }

  activate() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
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
        s3.putObject({
          Bucket: process.env.S3_BUCKET,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3BsdWdpbi5qcyJdLCJuYW1lcyI6WyJjb25maWciLCJ1cGRhdGUiLCJhY2Nlc3NLZXlJZCIsInByb2Nlc3MiLCJlbnYiLCJTM19BQ0NFU1NfS0VZIiwic2VjcmV0QWNjZXNzS2V5IiwiUzNfQUNDRVNTX1NFQ1JFVCIsInMzIiwiUzMiLCJzeW5jIiwiam9pbiIsIl9fZGlybmFtZSIsInJ1bkNvbW1hbmQiLCJhY2NvdW50IiwiZnVsY3J1bSIsImZldGNoQWNjb3VudCIsImFyZ3MiLCJvcmciLCJjb25zb2xlIiwiZXJyb3IiLCJoYW5kbGVQaG90b1NhdmUiLCJwaG90byIsImRvd25sb2FkVVJMIiwiZ2V0UGhvdG9VUkwiLCJ1cGxvYWRGaWxlIiwiaWQiLCJoYW5kbGVWaWRlb1NhdmUiLCJ2aWRlbyIsImdldFZpZGVvVVJMIiwiaGFuZGxlQXVkaW9TYXZlIiwiYXVkaW8iLCJnZXRBdWRpb1VSTCIsImhhbmRsZVNpZ25hdHVyZVNhdmUiLCJzaWduYXR1cmUiLCJnZXRTaWduYXR1cmVVUkwiLCJ0YXNrIiwiY2xpIiwiY29tbWFuZCIsImRlc2MiLCJidWlsZGVyIiwicmVxdWlyZWQiLCJ0eXBlIiwiaGFuZGxlciIsImFjdGl2YXRlIiwib24iLCJ0ZW1wUGF0aCIsIm1lZGlhIiwidXJsIiwibmFtZSIsInRlbXBGaWxlIiwiZG93bmxvYWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInB1dE9iamVjdCIsIkJ1Y2tldCIsIlMzX0JVQ0tFVCIsIktleSIsIkJvZHkiLCJjcmVhdGVSZWFkU3RyZWFtIiwiQUNMIiwicmVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLGlCQUFJQSxNQUFKLENBQVdDLE1BQVgsQ0FBa0I7QUFDaEJDLGVBQWFDLFFBQVFDLEdBQVIsQ0FBWUMsYUFEVDtBQUVoQkMsbUJBQWlCSCxRQUFRQyxHQUFSLENBQVlHO0FBRmIsQ0FBbEI7O0FBS0Es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LGVBQTlCO0FBQ0FmLGNBQVE4QixFQUFSLENBQVcsZ0JBQVgsRUFBNkIsT0FBS1osbUJBQWxDO0FBSmU7QUFLaEI7O0FBRURhLFdBQVNDLEtBQVQsRUFBZ0I7QUFDZCxXQUFPLGVBQUtwQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsS0FBckIsRUFBNEJtQyxNQUFNckIsRUFBbEMsQ0FBUDtBQUNEOztBQTBCS0QsWUFBTixDQUFpQlgsT0FBakIsRUFBMEJpQyxLQUExQixFQUFpQ0MsR0FBakMsRUFBc0NDLElBQXRDLEVBQTRDO0FBQUE7O0FBQUE7QUFDMUMsWUFBTUMsV0FBVyxPQUFLSixRQUFMLENBQWNDLEtBQWQsQ0FBakI7O0FBRUEsWUFBTSxnQ0FBVUksUUFBVixDQUFtQkgsR0FBbkIsRUFBd0JFLFFBQXhCLENBQU47O0FBRUEsYUFBTyxJQUFJRSxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDOUMsV0FBRytDLFNBQUgsQ0FBYTtBQUNYQyxrQkFBUXJELFFBQVFDLEdBQVIsQ0FBWXFELFNBRFQ7QUFFWEMsZUFBS1QsSUFGTTtBQUdYVSxnQkFBTSxhQUFHQyxnQkFBSCxDQUFvQlYsUUFBcEIsQ0FISztBQUlYVyxlQUFLO0FBSk0sU0FBYixFQUtHLFVBQUNDLEdBQUQsRUFBUztBQUNWLDJCQUFPcEQsSUFBUCxDQUFZd0MsUUFBWjs7QUFFQUc7QUFDRCxTQVREO0FBVUQsT0FYTSxDQUFQO0FBTDBDO0FBaUIzQztBQWhGa0IsQyIsImZpbGUiOiJwbHVnaW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQVdTIGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWtkaXJwIGZyb20gJ21rZGlycCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHJpbXJhZiBmcm9tICdyaW1yYWYnO1xuaW1wb3J0IHsgQVBJQ2xpZW50IH0gZnJvbSAnZnVsY3J1bSc7XG5cbkFXUy5jb25maWcudXBkYXRlKHtcbiAgYWNjZXNzS2V5SWQ6IHByb2Nlc3MuZW52LlMzX0FDQ0VTU19LRVksXG4gIHNlY3JldEFjY2Vzc0tleTogcHJvY2Vzcy5lbnYuUzNfQUNDRVNTX1NFQ1JFVFxufSk7XG5cbmNvbnN0IHMzID0gbmV3IEFXUy5TMygpO1xuXG5ta2RpcnAuc3luYyhwYXRoLmpvaW4oX19kaXJuYW1lLCAndG1wJykpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyB7XG4gIGFzeW5jIHRhc2soY2xpKSB7XG4gICAgcmV0dXJuIGNsaS5jb21tYW5kKHtcbiAgICAgIGNvbW1hbmQ6ICdzMycsXG4gICAgICBkZXNjOiAnc3luYyBtZWRpYSBmb3IgYW4gb3JnYW5pemF0aW9uIHRvIFMzJyxcbiAgICAgIGJ1aWxkZXI6IHtcbiAgICAgICAgb3JnOiB7XG4gICAgICAgICAgZGVzYzogJ29yZ2FuaXphdGlvbiBuYW1lJyxcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgaGFuZGxlcjogdGhpcy5ydW5Db21tYW5kXG4gICAgfSk7XG4gIH1cblxuICBydW5Db21tYW5kID0gYXN5bmMgKCkgPT4ge1xuICAgIC8vIGF3YWl0IHRoaXMuYWN0aXZhdGUoKTtcblxuICAgIGNvbnN0IGFjY291bnQgPSBhd2FpdCBmdWxjcnVtLmZldGNoQWNjb3VudChmdWxjcnVtLmFyZ3Mub3JnKTtcblxuICAgIGlmIChhY2NvdW50KSB7XG4gICAgICAvLyBkbyBzb21ldGhpbmdcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIGZpbmQgYWNjb3VudCcsIGZ1bGNydW0uYXJncy5vcmcpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGFjdGl2YXRlKCkge1xuICAgIGZ1bGNydW0ub24oJ3Bob3RvOnNhdmUnLCB0aGlzLmhhbmRsZVBob3RvU2F2ZSk7XG4gICAgZnVsY3J1bS5vbigndmlkZW86c2F2ZScsIHRoaXMuaGFuZGxlVmlkZW9TYXZlKTtcbiAgICBmdWxjcnVtLm9uKCdhdWRpbzpzYXZlJywgdGhpcy5oYW5kbGVBdWRpb1NhdmUpO1xuICAgIGZ1bGNydW0ub24oJ3NpZ25hdHVyZTpzYXZlJywgdGhpcy5oYW5kbGVTaWduYXR1cmVTYXZlKTtcbiAgfVxuXG4gIHRlbXBQYXRoKG1lZGlhKSB7XG4gICAgcmV0dXJuIHBhdGguam9pbihfX2Rpcm5hbWUsICd0bXAnLCBtZWRpYS5pZCk7XG4gIH1cblxuICBoYW5kbGVQaG90b1NhdmUgPSBhc3luYyAoe2FjY291bnQsIHBob3RvfSkgPT4ge1xuICAgIGNvbnN0IGRvd25sb2FkVVJMID0gQVBJQ2xpZW50LmdldFBob3RvVVJMKGFjY291bnQsIHBob3RvKTtcblxuICAgIGF3YWl0IHRoaXMudXBsb2FkRmlsZShhY2NvdW50LCBwaG90bywgZG93bmxvYWRVUkwsIGBwaG90b3MvJHtwaG90by5pZH0uanBnYCk7XG4gIH1cblxuICBoYW5kbGVWaWRlb1NhdmUgPSBhc3luYyAoe2FjY291bnQsIHZpZGVvfSkgPT4ge1xuICAgIGNvbnN0IGRvd25sb2FkVVJMID0gQVBJQ2xpZW50LmdldFZpZGVvVVJMKGFjY291bnQsIHZpZGVvKTtcblxuICAgIGF3YWl0IHRoaXMudXBsb2FkRmlsZShhY2NvdW50LCB2aWRlbywgZG93bmxvYWRVUkwsIGB2aWRlb3MvJHt2aWRlby5pZH0ubXA0YCk7XG4gIH1cblxuICBoYW5kbGVBdWRpb1NhdmUgPSBhc3luYyAoe2FjY291bnQsIGF1ZGlvfSkgPT4ge1xuICAgIGNvbnN0IGRvd25sb2FkVVJMID0gQVBJQ2xpZW50LmdldEF1ZGlvVVJMKGFjY291bnQsIGF1ZGlvKTtcblxuICAgIGF3YWl0IHRoaXMudXBsb2FkRmlsZShhY2NvdW50LCBhdWRpbywgZG93bmxvYWRVUkwsIGBhdWRpby8ke2F1ZGlvLmlkfS5tNGFgKTtcbiAgfVxuXG4gIGhhbmRsZVNpZ25hdHVyZVNhdmUgPSBhc3luYyAoe2FjY291bnQsIHNpZ25hdHVyZX0pID0+IHtcbiAgICBjb25zdCBkb3dubG9hZFVSTCA9IEFQSUNsaWVudC5nZXRTaWduYXR1cmVVUkwoYWNjb3VudCwgc2lnbmF0dXJlKTtcblxuICAgIGF3YWl0IHRoaXMudXBsb2FkRmlsZShhY2NvdW50LCBzaWduYXR1cmUsIGRvd25sb2FkVVJMLCBgc2lnbmF0dXJlcy8ke3NpZ25hdHVyZS5pZH0ucG5nYCk7XG4gIH1cblxuICBhc3luYyB1cGxvYWRGaWxlKGFjY291bnQsIG1lZGlhLCB1cmwsIG5hbWUpIHtcbiAgICBjb25zdCB0ZW1wRmlsZSA9IHRoaXMudGVtcFBhdGgobWVkaWEpO1xuXG4gICAgYXdhaXQgQVBJQ2xpZW50LmRvd25sb2FkKHVybCwgdGVtcEZpbGUpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHMzLnB1dE9iamVjdCh7XG4gICAgICAgIEJ1Y2tldDogcHJvY2Vzcy5lbnYuUzNfQlVDS0VULFxuICAgICAgICBLZXk6IG5hbWUsXG4gICAgICAgIEJvZHk6IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVtcEZpbGUpLFxuICAgICAgICBBQ0w6ICdwdWJsaWMtcmVhZCdcbiAgICAgIH0sIChyZXMpID0+IHtcbiAgICAgICAgcmltcmFmLnN5bmModGVtcEZpbGUpO1xuXG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=