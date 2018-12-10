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

var _tempy = require('tempy');

var _tempy2 = _interopRequireDefault(_tempy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const { log, warn, error } = fulcrum.logger.withContext('s3');

exports.default = class {
  constructor() {
    var _this = this;

    this.runCommand = _asyncToGenerator(function* () {
      yield _this.activate();

      const account = yield fulcrum.fetchAccount(fulcrum.args.org);

      if (account) {
        yield _this.syncAll(account);
        // do something
      } else {
        error('Unable to find account', fulcrum.args.org);
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
          },
          s3Region: {
            desc: 'S3 region',
            type: 'string',
            default: 'us-east-1'
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
        secretAccessKey: fulcrum.args.s3SecretAccessKey || process.env.S3_ACCESS_SECRET,
        region: fulcrum.args.s3Region || process.env.S3_REGION || 'us-east-1'
      });

      _this3.s3 = new _awsSdk2.default.S3();

      fulcrum.on('photo:save', _this3.handlePhotoSave);
      fulcrum.on('video:save', _this3.handleVideoSave);
      fulcrum.on('audio:save', _this3.handleAudioSave);
      fulcrum.on('signature:save', _this3.handleSignatureSave);
    })();
  }

  uploadFile(account, media, url, name) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const tempFile = _tempy2.default.file({ extension: 'download' });

      yield _fulcrumDesktopPlugin.APIClient.download(url, tempFile);

      return new Promise(function (resolve, reject) {
        const bodyStream = _fs2.default.createReadStream(tempFile);

        _this4.s3.putObject({
          Bucket: fulcrum.args.s3Bucket || process.env.S3_BUCKET,
          Key: name,
          Body: bodyStream,
          ACL: 'public-read'
        }, function (err, data) {
          bodyStream.close();

          _rimraf2.default.sync(tempFile);

          if (err) {
            error(err);
            return reject(err);
          }

          resolve(data);
        });
      });
    })();
  }

  syncAll(account) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      yield account.findEachPhoto({}, (() => {
        var _ref6 = _asyncToGenerator(function* (photo, { index }) {
          yield _this5.handlePhotoSave({ account, photo });
        });

        return function (_x5, _x6) {
          return _ref6.apply(this, arguments);
        };
      })());

      yield account.findEachVideo({}, (() => {
        var _ref7 = _asyncToGenerator(function* (video, { index }) {
          yield _this5.handleVideoSave({ account, video });
        });

        return function (_x7, _x8) {
          return _ref7.apply(this, arguments);
        };
      })());

      yield account.findEachAudio({}, (() => {
        var _ref8 = _asyncToGenerator(function* (audio, { index }) {
          yield _this5.handleAudioSave({ account, audio });
        });

        return function (_x9, _x10) {
          return _ref8.apply(this, arguments);
        };
      })());

      yield account.findEachSignature({}, (() => {
        var _ref9 = _asyncToGenerator(function* (signature, { index }) {
          yield _this5.handleSignatureSave({ account, signature });
        });

        return function (_x11, _x12) {
          return _ref9.apply(this, arguments);
        };
      })());
    })();
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3BsdWdpbi5qcyJdLCJuYW1lcyI6WyJsb2ciLCJ3YXJuIiwiZXJyb3IiLCJmdWxjcnVtIiwibG9nZ2VyIiwid2l0aENvbnRleHQiLCJydW5Db21tYW5kIiwiYWN0aXZhdGUiLCJhY2NvdW50IiwiZmV0Y2hBY2NvdW50IiwiYXJncyIsIm9yZyIsInN5bmNBbGwiLCJoYW5kbGVQaG90b1NhdmUiLCJwaG90byIsImRvd25sb2FkVVJMIiwiZ2V0UGhvdG9VUkwiLCJ1cGxvYWRGaWxlIiwiaWQiLCJoYW5kbGVWaWRlb1NhdmUiLCJ2aWRlbyIsImdldFZpZGVvVVJMIiwiaGFuZGxlQXVkaW9TYXZlIiwiYXVkaW8iLCJnZXRBdWRpb1VSTCIsImhhbmRsZVNpZ25hdHVyZVNhdmUiLCJzaWduYXR1cmUiLCJnZXRTaWduYXR1cmVVUkwiLCJ0YXNrIiwiY2xpIiwiY29tbWFuZCIsImRlc2MiLCJidWlsZGVyIiwicmVxdWlyZWQiLCJ0eXBlIiwiczNBY2Nlc3NLZXlJZCIsInMzU2VjcmV0QWNjZXNzS2V5IiwiczNCdWNrZXQiLCJzM1JlZ2lvbiIsImRlZmF1bHQiLCJoYW5kbGVyIiwiY29uZmlnIiwidXBkYXRlIiwiYWNjZXNzS2V5SWQiLCJwcm9jZXNzIiwiZW52IiwiUzNfQUNDRVNTX0tFWSIsInNlY3JldEFjY2Vzc0tleSIsIlMzX0FDQ0VTU19TRUNSRVQiLCJyZWdpb24iLCJTM19SRUdJT04iLCJzMyIsIlMzIiwib24iLCJtZWRpYSIsInVybCIsIm5hbWUiLCJ0ZW1wRmlsZSIsImZpbGUiLCJleHRlbnNpb24iLCJkb3dubG9hZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiYm9keVN0cmVhbSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJwdXRPYmplY3QiLCJCdWNrZXQiLCJTM19CVUNLRVQiLCJLZXkiLCJCb2R5IiwiQUNMIiwiZXJyIiwiZGF0YSIsImNsb3NlIiwic3luYyIsImZpbmRFYWNoUGhvdG8iLCJpbmRleCIsImZpbmRFYWNoVmlkZW8iLCJmaW5k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QXJCLENBQU47QUFDRCxTQUZLOztBQUFBO0FBQUE7QUFBQTtBQUFBLFdBQU47O0FBSUEsWUFBTVosUUFBUXVFLGFBQVIsQ0FBc0IsRUFBdEI7QUFBQSxzQ0FBMEIsV0FBT3hELEtBQVAsRUFBYyxFQUFDc0QsS0FBRCxFQUFkLEVBQTBCO0FBQ3hELGdCQUFNLE9BQUt2RCxlQUFMLENBQXFCLEVBQUNkLE9BQUQsRUFBVWUsS0FBVixFQUFyQixDQUFOO0FBQ0QsU0FGSzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxXQUFOOztBQUlBLFlBQU1mLFFBQVF3RSxpQkFBUixDQUEwQixFQUExQjtBQUFBLHNDQUE4QixXQUFPdEQsU0FBUCxFQUFrQixFQUFDbUQsS0FBRCxFQUFsQixFQUE4QjtBQUNoRSxnQkFBTSxPQUFLcEQsbUJBQUwsQ0FBeUIsRUFBQ2pCLE9BQUQsRUFBVWtCLFNBQVYsRUFBekIsQ0FBTjtBQUNELFNBRks7O0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FBTjtBQWJxQjtBQWdCdEI7QUFqSWtCLEMiLCJmaWxlIjoicGx1Z2luLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEFXUyBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1rZGlycCBmcm9tICdta2RpcnAnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCByaW1yYWYgZnJvbSAncmltcmFmJztcbmltcG9ydCB7IEFQSUNsaWVudCB9IGZyb20gJ2Z1bGNydW0nO1xuaW1wb3J0IHRlbXB5IGZyb20gJ3RlbXB5JztcblxuY29uc3QgeyBsb2csIHdhcm4sIGVycm9yIH0gPSBmdWxjcnVtLmxvZ2dlci53aXRoQ29udGV4dCgnczMnKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBhc3luYyB0YXNrKGNsaSkge1xuICAgIHJldHVybiBjbGkuY29tbWFuZCh7XG4gICAgICBjb21tYW5kOiAnczMnLFxuICAgICAgZGVzYzogJ3N5bmMgbWVkaWEgZm9yIGFuIG9yZ2FuaXphdGlvbiB0byBTMycsXG4gICAgICBidWlsZGVyOiB7XG4gICAgICAgIG9yZzoge1xuICAgICAgICAgIGRlc2M6ICdvcmdhbml6YXRpb24gbmFtZScsXG4gICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfSxcbiAgICAgICAgczNBY2Nlc3NLZXlJZDoge1xuICAgICAgICAgIGRlc2M6ICdTMyBhY2Nlc3Mga2V5IGlkJyxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBzM1NlY3JldEFjY2Vzc0tleToge1xuICAgICAgICAgIGRlc2M6ICdTMyBzZWNyZXQgYWNjZXNzIGtleScsXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgfSxcbiAgICAgICAgczNCdWNrZXQ6IHtcbiAgICAgICAgICBkZXNjOiAnUzMgYnVja2V0JyxcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICB9LFxuICAgICAgICBzM1JlZ2lvbjoge1xuICAgICAgICAgIGRlc2M6ICdTMyByZWdpb24nLFxuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgIGRlZmF1bHQ6ICd1cy1lYXN0LTEnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBoYW5kbGVyOiB0aGlzLnJ1bkNvbW1hbmRcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bkNvbW1hbmQgPSBhc3luYyAoKSA9PiB7XG4gICAgYXdhaXQgdGhpcy5hY3RpdmF0ZSgpO1xuXG4gICAgY29uc3QgYWNjb3VudCA9IGF3YWl0IGZ1bGNydW0uZmV0Y2hBY2NvdW50KGZ1bGNydW0uYXJncy5vcmcpO1xuXG4gICAgaWYgKGFjY291bnQpIHtcbiAgICAgIGF3YWl0IHRoaXMuc3luY0FsbChhY2NvdW50KTtcbiAgICAgIC8vIGRvIHNvbWV0aGluZ1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvcignVW5hYmxlIHRvIGZpbmQgYWNjb3VudCcsIGZ1bGNydW0uYXJncy5vcmcpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGFjdGl2YXRlKCkge1xuICAgIEFXUy5jb25maWcudXBkYXRlKHtcbiAgICAgIGFjY2Vzc0tleUlkOiBmdWxjcnVtLmFyZ3MuczNBY2Nlc3NLZXlJZCB8fCBwcm9jZXNzLmVudi5TM19BQ0NFU1NfS0VZLFxuICAgICAgc2VjcmV0QWNjZXNzS2V5OiBmdWxjcnVtLmFyZ3MuczNTZWNyZXRBY2Nlc3NLZXkgfHwgcHJvY2Vzcy5lbnYuUzNfQUNDRVNTX1NFQ1JFVCxcbiAgICAgIHJlZ2lvbjogZnVsY3J1bS5hcmdzLnMzUmVnaW9uIHx8IHByb2Nlc3MuZW52LlMzX1JFR0lPTiB8fCAndXMtZWFzdC0xJ1xuICAgIH0pO1xuXG4gICAgdGhpcy5zMyA9IG5ldyBBV1MuUzMoKTtcblxuICAgIGZ1bGNydW0ub24oJ3Bob3RvOnNhdmUnLCB0aGlzLmhhbmRsZVBob3RvU2F2ZSk7XG4gICAgZnVsY3J1bS5vbigndmlkZW86c2F2ZScsIHRoaXMuaGFuZGxlVmlkZW9TYXZlKTtcbiAgICBmdWxjcnVtLm9uKCdhdWRpbzpzYXZlJywgdGhpcy5oYW5kbGVBdWRpb1NhdmUpO1xuICAgIGZ1bGNydW0ub24oJ3NpZ25hdHVyZTpzYXZlJywgdGhpcy5oYW5kbGVTaWduYXR1cmVTYXZlKTtcbiAgfVxuXG4gIGhhbmRsZVBob3RvU2F2ZSA9IGFzeW5jICh7YWNjb3VudCwgcGhvdG99KSA9PiB7XG4gICAgY29uc3QgZG93bmxvYWRVUkwgPSBBUElDbGllbnQuZ2V0UGhvdG9VUkwoYWNjb3VudCwgcGhvdG8pO1xuXG4gICAgYXdhaXQgdGhpcy51cGxvYWRGaWxlKGFjY291bnQsIHBob3RvLCBkb3dubG9hZFVSTCwgYHBob3Rvcy8ke3Bob3RvLmlkfS5qcGdgKTtcbiAgfVxuXG4gIGhhbmRsZVZpZGVvU2F2ZSA9IGFzeW5jICh7YWNjb3VudCwgdmlkZW99KSA9PiB7XG4gICAgY29uc3QgZG93bmxvYWRVUkwgPSBBUElDbGllbnQuZ2V0VmlkZW9VUkwoYWNjb3VudCwgdmlkZW8pO1xuXG4gICAgYXdhaXQgdGhpcy51cGxvYWRGaWxlKGFjY291bnQsIHZpZGVvLCBkb3dubG9hZFVSTCwgYHZpZGVvcy8ke3ZpZGVvLmlkfS5tcDRgKTtcbiAgfVxuXG4gIGhhbmRsZUF1ZGlvU2F2ZSA9IGFzeW5jICh7YWNjb3VudCwgYXVkaW99KSA9PiB7XG4gICAgY29uc3QgZG93bmxvYWRVUkwgPSBBUElDbGllbnQuZ2V0QXVkaW9VUkwoYWNjb3VudCwgYXVkaW8pO1xuXG4gICAgYXdhaXQgdGhpcy51cGxvYWRGaWxlKGFjY291bnQsIGF1ZGlvLCBkb3dubG9hZFVSTCwgYGF1ZGlvLyR7YXVkaW8uaWR9Lm00YWApO1xuICB9XG5cbiAgaGFuZGxlU2lnbmF0dXJlU2F2ZSA9IGFzeW5jICh7YWNjb3VudCwgc2lnbmF0dXJlfSkgPT4ge1xuICAgIGNvbnN0IGRvd25sb2FkVVJMID0gQVBJQ2xpZW50LmdldFNpZ25hdHVyZVVSTChhY2NvdW50LCBzaWduYXR1cmUpO1xuXG4gICAgYXdhaXQgdGhpcy51cGxvYWRGaWxlKGFjY291bnQsIHNpZ25hdHVyZSwgZG93bmxvYWRVUkwsIGBzaWduYXR1cmVzLyR7c2lnbmF0dXJlLmlkfS5wbmdgKTtcbiAgfVxuXG4gIGFzeW5jIHVwbG9hZEZpbGUoYWNjb3VudCwgbWVkaWEsIHVybCwgbmFtZSkge1xuICAgIGNvbnN0IHRlbXBGaWxlID0gdGVtcHkuZmlsZSh7ZXh0ZW5zaW9uOiAnZG93bmxvYWQnfSk7XG5cbiAgICBhd2FpdCBBUElDbGllbnQuZG93bmxvYWQodXJsLCB0ZW1wRmlsZSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgYm9keVN0cmVhbSA9IGZzLmNyZWF0ZVJlYWRTdHJlYW0odGVtcEZpbGUpO1xuXG4gICAgICB0aGlzLnMzLnB1dE9iamVjdCh7XG4gICAgICAgIEJ1Y2tldDogZnVsY3J1bS5hcmdzLnMzQnVja2V0IHx8IHByb2Nlc3MuZW52LlMzX0JVQ0tFVCxcbiAgICAgICAgS2V5OiBuYW1lLFxuICAgICAgICBCb2R5OiBib2R5U3RyZWFtLFxuICAgICAgICBBQ0w6ICdwdWJsaWMtcmVhZCdcbiAgICAgIH0sIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgYm9keVN0cmVhbS5jbG9zZSgpO1xuXG4gICAgICAgIHJpbXJhZi5zeW5jKHRlbXBGaWxlKTtcblxuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZXJyb3IoZXJyKTtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzeW5jQWxsKGFjY291bnQpIHtcbiAgICBhd2FpdCBhY2NvdW50LmZpbmRFYWNoUGhvdG8oe30sIGFzeW5jIChwaG90bywge2luZGV4fSkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVQaG90b1NhdmUoe2FjY291bnQsIHBob3RvfSk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBhY2NvdW50LmZpbmRFYWNoVmlkZW8oe30sIGFzeW5jICh2aWRlbywge2luZGV4fSkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVWaWRlb1NhdmUoe2FjY291bnQsIHZpZGVvfSk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBhY2NvdW50LmZpbmRFYWNoQXVkaW8oe30sIGFzeW5jIChhdWRpbywge2luZGV4fSkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5oYW5kbGVBdWRpb1NhdmUoe2FjY291bnQsIGF1ZGlvfSk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBhY2NvdW50LmZpbmRFYWNoU2lnbmF0dXJlKHt9LCBhc3luYyAoc2lnbmF0dXJlLCB7aW5kZXh9KSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLmhhbmRsZVNpZ25hdHVyZVNhdmUoe2FjY291bnQsIHNpZ25hdHVyZX0pO1xuICAgIH0pO1xuICB9XG59XG4iXX0=