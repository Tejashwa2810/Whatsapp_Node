require('dotenv').config()
const axios = require('axios')

async function sendTemplateMessage(){
    const response = await axios({
        url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '919149383414',
            type: 'template',
            template: {
                name: "hello_world",
                language: {
                    code: 'en_US'
                }
            }
        })
    })

    console.log(response.data);
}


async function sendTextMessage(){
    const response = await axios({
        url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '919149383414',
            type: 'text',
            text: {
                body: 'This is a Text message'
            }
        })
    })

    console.log(response.data);
}



async function sendMediaMessage(){
    const response = await axios({
        url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
        method: 'post',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '919149383414',
            type: 'image',
            image: {
                link: 'https://dummyimage.com/600x400/000/fff.png&text=Puchka+Das',
                caption: 'we are open now'
            }
        })
    })

    console.log(response.data);
}


sendTemplateMessage()