const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let boticon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription('스크리블 - https://skribbl.io/\n끄투리 - https://kkutu.co.kr/')
    .setColor("#FFFF00")

    return message.channel.send(botembed);
}
module.exports.help = {
    name: "심심해"
}