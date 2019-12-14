import { notification, Modal } from 'antd';
import _ from 'lodash';

// Type: success,info, warning, error
const Notification = (type, ...args) => {
  if (args.length === 2) {
    const [title, content] = args;
    notification[type]({
      message: title,
      description: content
    });
  } else if (args.length === 1 && _.isObject(args[0])) {
    notification[type](args[0]);
  }
};

const AllMessages = [];

const Message = (type, ...args) => {
  let msg;
  const maskClosable = true;
  if (args.length === 2) {
    const [title, content] = args;
    msg = Modal[type]({title, content, maskClosable});
  } else if (args.length === 1 && _.isObject(args[0])) {
    msg = Modal[type](_.defaults(args[0], {maskClosable}));
  }
  AllMessages.push(msg);
};

const DestoryAllMsg = () => {
  _.each(AllMessages, (msg) => { msg.destory(); });
}

export { Notification, Message, DestoryAllMsg };
