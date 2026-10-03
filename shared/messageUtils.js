export async function sendTemp(channel, payload, time = 600000) {
  const msg = await channel.send(payload);

  setTimeout(() => {
    safe(msg.delete());
  }, time);

  return msg;
}

// Handle errors from delete/edit interactions
export async function safe(promise) {
  try {
    return await promise;
  } catch (err) {
    // Unknown Message, Unknown Channel, Missing Permissions
    const ignored = [10008, 10003, 50013];

    if (!ignored.includes(err?.code)) {
      console.error(err);
    }
  }
}
