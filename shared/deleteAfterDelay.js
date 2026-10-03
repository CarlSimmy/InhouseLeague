import { safe } from './messageUtils.js';

const deleteAfterSecondsDelay = (message, delay, isButton = false) => {
  setTimeout(() => {
    if (isButton) {
      safe(message.deleteReply());
    }
    else {
      safe(message.delete());
    }
  }, delay * 1000);
};

export default deleteAfterSecondsDelay;
