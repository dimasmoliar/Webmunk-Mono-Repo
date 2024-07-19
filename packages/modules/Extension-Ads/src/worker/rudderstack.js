import { Analytics } from "@rudderstack/analytics-js-service-worker";
import webext from "./webext";

export class RudderStack {
  static events = Object.freeze({
    AD_DETECTED: 'ad_detected',
    AD_CLICKED: 'ad_clicked',
  });

  constructor() {
      this._client = new Analytics('2hv3OHj4joAaarruwt337mRuFhx','https://unibrixdmyrfcl.dataplane.rudderstack.com');
  }

  async track(event, properties) {
    const userId = await this._getUserIdentifier();

    if (!userId) {
      console.error('There is no user identifier. Please register.');
      return;
    }

    if (!this._isSupportedEvent(event)) {
      throw new Error('Unsupported event!');
    }

    return new Promise((resolve, reject) => {
      this._client.track({
        event,
        properties,
        userId,
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async flush() {
    return new Promise((resolve, reject) => {
      this._client.flush((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  _isSupportedEvent(event) {
    return Object.values(RudderStack.events).includes(event);
  }

  async _getUserIdentifier() {
    const result = await webext.storage.local.get('identifier');
    return result.identifier;
  }
}