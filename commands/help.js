const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let boticon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setTitle("LOADED 봇입니다")
    .setDescription("**업로드한 파일 모아보기 작동 중**\n**0시, 4시, 7시 알람**\n**굿, 굳, 음, 흠 반응**\n\n**!뭐먹**\n`뭐 먹을지 골라줄게~`\n\n**!내전**\n`내전 팀을 만들어드림`\n\n**!심심해**\n`심심할 땐?`\n\n**mm 재생, 스킵, 정지, 음량, 재생중, 리스트, pp, resume **\n\n기능 추가 아이디어 받습니다")
    .setColor("#00FFFF")
    .setThumbnail(boticon)
    .setFooter("- BBOM#6657")
            
    return message.channel.send(botembed);
}

module.exports.help = {
    name: "도움"
}