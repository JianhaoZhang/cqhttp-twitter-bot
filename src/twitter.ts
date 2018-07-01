import * as fs from 'fs';
import * as log4js from 'log4js';
import * as path from 'path';
import * as Twitter from 'twitter';

interface IWorkerOption {
  lock: ILock;
  lockfile: string;
  workInterval: number;
  consumer_key: string;
  consumer_secret: string;
  access_token_key: string;
  access_token_secret: string;
}

const logger = log4js.getLogger('twitter');
logger.level = 'info';

export default class {

  private client;
  private lock: ILock;
  private lockfile: string;
  private workInterval: number;

  constructor(opt: IWorkerOption) {
    this.client = new Twitter({
      consumer_key: opt.consumer_key,
      consumer_secret: opt.consumer_secret,
      access_token_key: opt.access_token_key,
      access_token_secret: opt.access_token_secret,
    });
    this.lockfile = opt.lockfile;
    this.lock = opt.lock;
    this.workInterval = opt.workInterval;
  }

  public work = () => {
    const lock = this.lock;
    if (this.workInterval < 1) this.workInterval = 1;
    if (lock.feed.length === 0) {
      setTimeout(() => {
        this.work();
      }, this.workInterval * 1000);
      return;
    }
    if (lock.workon >= lock.feed.length) lock.workon = 0;
    if (!lock.threads[lock.feed[lock.workon]] ||
      !lock.threads[lock.feed[lock.workon]].subscribers ||
      lock.threads[lock.feed[lock.workon]].subscribers.length === 0) {
      logger.error(`nobody subscribes thread ${lock.feed[lock.workon]}, removing from feed`);
      lock.feed.splice(lock.workon, 1);
      fs.writeFileSync(path.resolve(this.lockfile), JSON.stringify(lock));
      this.work();
      return;
    }

    let match = lock.feed[lock.workon].match(/https:\/\/twitter.com\/([^\/]+)\/lists\/([^\/]+)/);
    if (match) {
      const config: any = {
        owner_screen_name: match[1],
        slug: match[2],
      };
      const offset = lock.threads[lock.feed[lock.workon]].offset;
      if (offset > 0) config.since_id =  offset;
      this.client.get('lists/statuses', config, (error, tweets, response) => {
        console.log(tweets);
      });
    } else {
      match = lock.feed[lock.workon].match(/https:\/\/twitter.com\/([^\/]+)/);
      if (match) {
        const config: any = {
          screen_name: match[1],
        };
        const offset = lock.threads[lock.feed[lock.workon]].offset;
        if (offset > 0) config.since_id =  offset;
        this.client.get('statuses/user_timeline', config, (error, tweets, response) => {
          console.log(tweets);
        });
      }
    }

    lock.workon++;
    let timeout = this.workInterval * 1000 / lock.feed.length;
    if (timeout < 1000) timeout = 1000;
    fs.writeFileSync(path.resolve(this.lockfile), JSON.stringify(lock));
    setTimeout(() => {
      this.work();
    }, timeout);
  }
}