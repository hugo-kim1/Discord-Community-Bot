const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let foods = [
        '치킨',
        '피자',
        '햄버거',
        '김치찌개',
        '부대찌개',
        '제육볶음',
        '떡볶이',
        '삼겹살',
        '소고기!'
    ];
    
    let rand = Math.random();
    let totalFood = foods.length;
    let randIndex = Math.floor(rand * totalFood);
    let randomFood = foods[randIndex]

    return message.channel.send(randomFood);
}

module.exports.help = {
    name: "뭐먹"
}