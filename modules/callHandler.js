const MessageBuilder = require("../modules/MessageBuilder");

module.exports = async(client, message, callDocument) => {
	let perms = await client.permCheck(message.author.id);
	let sendChannel;
	if (message.channel.id === callDocument.to.channelID) {
		sendChannel = callDocument.from.channelID;
	} else if (message.channel.id === callDocument.from.channelID) {
		sendChannel = callDocument.to.channelID;
	} else {
		message.reply("Error! Please contact a bot developer.");
	}
	message.content = message.content.replace(/@(everyone|here)/g, `@­$1`);
	let sent;
	if (perms.donator || message.author.id === `139836912335716352`) {
		sent = await client.apiSend(`**${message.author.tag}** :arrow_right: <:GoldPhone:320768431307882497> ${message.content}`, sendChannel);
	} else if (perms.support) {
		sent = await client.apiSend(`**${message.author.tag}** :arrow_right: :telephone_receiver: ${message.content}`, sendChannel);
	} else {
		sent = await client.apiSend(`**${message.author.tag}** :arrow_right: <:DiscordTelPhone:310817969498226718> ${message.content}`, sendChannel);
	}
	callDocument.messages.push({
		bmessage: sent.id,
		umessage: message.id,
		creator: message.author.id,
	});
	await callDocument.save();
	setTimeout(async() => {
		let newcallDocument = await Calls.findOne({ _id: callDocument._id });
		if (!newcallDocument) return;
		if (newcallDocument.messages.last() !== callDocument.messages.last()) return;

		callDocument.status = false;
		await callDocument.save();
		message.reply(":negative_squared_cross_mark: This call has expired (2 minutes).");
		client.apiSend(":x: This call has expired (2 minutes).", callDocument.to.channelID);
		client.apiSend(`:telephone: The call between channel ${callDocument.from.channelID} and channel ${callDocument.to.channelID} has expired.`, process.env.LOGSCHANNEL);
		await OldCalls.create(new OldCalls(callDocument));
		await callDocument.remove();
	}, 2000);
};
