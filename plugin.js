import Plugin from 'fulcrum-sync-plugin';
import AWS from 'aws-sdk';
import path from 'path';
import mkdirp from 'mkdirp';
import fs from 'fs';
import rimraf from 'rimraf';

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET
});

const s3 = new AWS.S3();

mkdirp.sync(path.join(__dirname, 'tmp'));

export default class S3Plugin extends Plugin {
  get enabled() {
    return false;
  }

  async runTask({app, yargs}) {
    const args =
      yargs.usage('Usage: s3 --org [org]')
        .demandOption([ 'org' ])
        .argv;

    const account = await app.fetchAccount(args.org);

    if (account) {
      // do something
    } else {
      console.error('Unable to find account', args.org);
    }
  }

  async initialize({app}) {
    app.on('photo:save', this.handlePhotoSave);
    app.on('video:save', this.handleVideoSave);
    app.on('audio:save', this.handleAudioSave);
    app.on('signature:save', this.handleSignatureSave);
  }

  tempPath(media) {
    return path.join(__dirname, 'tmp', media.id);
  }

  handlePhotoSave = async ({account, photo}) => {
    const downloadURL = this.app.api.Client.getPhotoURL(account, photo);

    await this.uploadFile(account, photo, downloadURL, `photos/${photo.id}.jpg`);
  }

  handleVideoSave = async ({account, video}) => {
    const downloadURL = this.app.api.Client.getVideoURL(account, video);

    await this.uploadFile(account, photo, downloadURL, `videos/${video.id}.mp4`);
  }

  handleAudioSave = async ({account, audio}) => {
    const downloadURL = this.app.api.Client.getAudioURL(account, audio);

    await this.uploadFile(account, photo, downloadURL, `audio/${audio.id}.m4a`);
  }

  handleSignatureSave = async ({account, signature}) => {
    const downloadURL = this.app.api.Client.getSignatureURL(account, signature);

    await this.uploadFile(account, photo, downloadURL, `signatures/${signature.id}.png`);
  }

  async uploadFile(account, media, url, name) {
    const tempFile = this.tempPath(media);

    await this.app.api.Client.download(url, tempFile);

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
