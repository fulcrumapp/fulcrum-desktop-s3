import AWS from 'aws-sdk';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rimraf from 'rimraf';
import { APIClient } from 'fulcrum';
import tempy from 'tempy';

const { log, warn, error } = fulcrum.logger.withContext('s3');

export default class {
  async task(cli) {
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
      handler: this.runCommand
    });
  }

  runCommand = async () => {
    await this.activate();

    const account = await fulcrum.fetchAccount(fulcrum.args.org);

    if (account) {
      await this.syncAll(account);
    } else {
      error('Unable to find account', fulcrum.args.org);
    }
  }

  async activate() {
    AWS.config.update({
      accessKeyId: fulcrum.args.s3AccessKeyId || process.env.S3_ACCESS_KEY,
      secretAccessKey: fulcrum.args.s3SecretAccessKey || process.env.S3_ACCESS_SECRET,
      region: fulcrum.args.s3Region || process.env.S3_REGION || 'us-east-1'
    });

    this.s3 = new AWS.S3();

    fulcrum.on('photo:save', this.handlePhotoSave);
    fulcrum.on('video:save', this.handleVideoSave);
    fulcrum.on('audio:save', this.handleAudioSave);
    fulcrum.on('signature:save', this.handleSignatureSave);
  }

  handlePhotoSave = async ({account, photo}) => {
    const downloadURL = APIClient.getPhotoURL(account, photo);

    await this.uploadFile(account, photo, downloadURL, `photos/${photo.id}.jpg`);
  }

  handleVideoSave = async ({account, video}) => {
    const downloadURL = APIClient.getVideoURL(account, video);

    await this.uploadFile(account, video, downloadURL, `videos/${video.id}.mp4`);
  }

  handleAudioSave = async ({account, audio}) => {
    const downloadURL = APIClient.getAudioURL(account, audio);

    await this.uploadFile(account, audio, downloadURL, `audio/${audio.id}.m4a`);
  }

  handleSignatureSave = async ({account, signature}) => {
    const downloadURL = APIClient.getSignatureURL(account, signature);

    await this.uploadFile(account, signature, downloadURL, `signatures/${signature.id}.png`);
  }

  async uploadFile(account, media, url, name) {
    const tempFile = tempy.file({extension: 'download'});

    await APIClient.download(url, tempFile);

    return new Promise((resolve, reject) => {
      const bodyStream = fs.createReadStream(tempFile);

      this.s3.putObject({
        Bucket: fulcrum.args.s3Bucket || process.env.S3_BUCKET,
        Key: name,
        Body: bodyStream,
        ACL: 'public-read'
      }, (err, data) => {
        bodyStream.close();

        rimraf.sync(tempFile);

        if (err) {
          error(err);
          return reject(err);
        }

        resolve(data);
      });
    });
  }

  async syncAll(account) {
    await account.findEachPhoto({}, async (photo, {index}) => {
      await this.handlePhotoSave({account, photo});
    });

    await account.findEachVideo({}, async (video, {index}) => {
      await this.handleVideoSave({account, video});
    });

    await account.findEachAudio({}, async (audio, {index}) => {
      await this.handleAudioSave({account, audio});
    });

    await account.findEachSignature({}, async (signature, {index}) => {
      await this.handleSignatureSave({account, signature});
    });
  }
}
