const deleteAfterSecondsDelay = (message, delay, isButton = false) => {
  setTimeout(() => {
    if (isButton) {
      message.deleteReply();
    }
    else {
      message.delete();
    }
  }, delay * 1000);
};

export default deleteAfterSecondsDelay;
