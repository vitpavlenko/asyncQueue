'use strict';
const ChannelClosed = { name: 'Channel closed event'};
class Channel {
  constructor() {
    this.sources = [];
    this.sinks = [];
    this.opened = true;
  }
  push(el) {
    return new Promise((resolve, reject) => {
      if (this.sinks.length) {
        const sink = this.sinks.shift();
        resolve();
        sink.resolver(el);
      } else {
        this.sources.push({resolver: resolve, rejecter: reject, el: el});
      }
    });
  }
  pull() {
    return new Promise((resolve) => {
      if (this.sources.length) {
        const source = this.sources.shift();
        source.resolver();
        resolve(source.el);
      } else {
        this.sinks.push({resolver: resolve});
      }
    });
  }
  close() {
    this.opened = false;
    for (let i = 0; i < this.sinks.length; ++i) {
      const sink = this.sinks[i];
      sink.resolver(Channel.channelClosedEvent());
    }
    this.sinks = []
    for (let i = 0; i < this.sources.length; ++i) {
      const source = this.sources[i];
      source.rejecter(Channel.channelClosedEvent());
    }
    this.sources = [];
  }
  isOpen() {
    return this.opened;
  }
  static channelClosedEvent() {
    return ChannelClosed;
  }
}

module.exports = Channel;