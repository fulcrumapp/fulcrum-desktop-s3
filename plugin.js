import AWS from 'aws-sdk';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rimraf from 'rimraf';
import { APIClient } from 'fulcrum';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET
});

const s3 = new AWS.S3();

mkdirp.sync(path.join(__dirname, 'tmp'));

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
        }
      },
      handler: this.runCommand
    });
  }

  runCommand = async () => {
    // await this.activate();

    const account = await fulcrum.fetchAccount(fulcrum.args.org);

    if (account) {
      // do something
    } else {
      console.error('Unable to find account', fulcrum.args.org);
    }
  }

  async activate() {
    return;

    fulcrum.on('photo:save', this.handlePhotoSave);
    fulcrum.on('video:save', this.handleVideoSave);
    fulcrum.on('audio:save', this.handleAudioSave);
    fulcrum.on('signature:save', this.handleSignatureSave);
  }

  tempPath(media) {
    return path.join(__dirname, 'tmp', media.id);
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
    const tempFile = this.tempPath(media);

    await APIClient.download(url, tempFile);

    return new Promise((resolve, reject) => {
      s3.putObject({
        Bucket: process.env.S3_BUCKET,
        Key: name,
        Body: fs.createReadStream(tempFile),
        ACL: 'public-read'
      }, (res) => {
        rimraf.sync(tempFile);

        resolve();
      });
    });
  }
}
