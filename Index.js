// require('dotenv').config()
// const axios = require('axios')

// async function sendTemplateMessage(){
//     const response = await axios({
//         url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '919149383414',
//             type: 'template',
//             template: {
//                 name: "hello_world",
//                 language: {
//                     code: 'en_US'
//                 }
//             }
//         })
//     })

//     console.log(response.data);
// }


// async function sendTextMessage(){
//     const response = await axios({
//         url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '919149383414',
//             type: 'text',
//             text: {
//                 body: 'This is a Text message'
//             }
//         })
//     })

//     console.log(response.data);
// }



// async function sendMediaMessage(){
//     const response = await axios({
//         url: 'https://graph.facebook.com/v21.0/551429368058914/messages',
//         method: 'post',
//         headers: {
//             'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
//             'Content-Type': 'application/json'
//         },
//         data: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to: '919149383414',
//             type: 'image',
//             image: {
//                 link: 'https://dummyimage.com/600x400/000/fff.png&text=Puchka+Das',
//                 caption: 'we are open now'
//             }
//         })
//     })

//     console.log(response.data);
// }


// sendTemplateMessage()



require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const usersSession = {}; // Store active sessions

const MENU_ITEMS = {
    1: { name: "Pani Puri", price: 20 },
    2: { name: "Bhel Puri", price: 30 },
    3: { name: "Sev Puri", price: 25 },
    4: { name: "Dahi Puri", price: 35 }
};

// WhatsApp API URL
const WHATSAPP_URL = `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`;

async function sendMessage(to, message) {
    await axios.post(WHATSAPP_URL, {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
    }, {
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
        }
    });
}

app.get('/webhook', (req, res) => {
    if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
        res.send(req.query["hub.challenge"]);
    } else {
        res.send("Verification failed");
    }
});

app.post('/webhook', async (req, res) => {
    const messageData = req.body;

    if (messageData.object) {
        const messages = messageData.entry?.[0]?.changes?.[0]?.value?.messages;
        if (messages) {
            for (const message of messages) {
                const from = message.from;
                const text = message.text?.body?.toLowerCase().trim();

                if (!usersSession[from]) {
                    usersSession[from] = { stage: "greeting", order: [] };
                    await sendMessage(from, `🌟 *Welcome to Puchka Das!* 🌟\n\n🍽️ Type *menu* to see our delicious items.`);
                    continue;
                }

                if (text === "menu") {
                    let menuMessage = "🍽️ Menu:\n";
                    for (let id in MENU_ITEMS) {
                        menuMessage += `*${id}*. ${MENU_ITEMS[id].name} - ₹${MENU_ITEMS[id].price}\n`;
                    }
                    menuMessage += "\n🛒 To order, type: <index> <quantity> (e.g., 1 2 for 2 Pani Puris)";
                    usersSession[from].stage = "ordering";
                    await sendMessage(from, menuMessage);
                } else if (usersSession[from].stage === "ordering") {
                    const orderMatch = text.match(/^(\d+)\s+(\d+)$/);
                    if (orderMatch) {
                        const index = parseInt(orderMatch[1]);
                        const quantity = parseInt(orderMatch[2]);

                        if (MENU_ITEMS[index]) {
                            usersSession[from].order.push({ item: MENU_ITEMS[index], quantity });
                            await sendMessage(from, `✅ *${quantity}x ${MENU_ITEMS[index].name}* added to your cart.\n\n🛍️ Type *done* to confirm or *menu* to add more.`);
                        } else {
                            await sendMessage(from, "❌ Invalid item index. Type menu to see available items.");
                        }
                    } else if (text === "done") {
                        let totalAmount = 0;
                        let orderSummary = "🛒 Your Order Summary:\n";
                        usersSession[from].order.forEach(order => {
                            orderSummary += `- ${order.quantity}x ${order.item.name} - ₹${order.item.price * order.quantity}\n`;
                            totalAmount += order.item.price * order.quantity;
                        });
                        orderSummary += `\n💰 *Total: ₹${totalAmount}*\n\n🎉 Thank you for ordering from *Puchka Das*! 🎊`;

                        await sendMessage(from, orderSummary);

                        delete usersSession[from]; // Reset session
                    } else {
                        await sendMessage(from, "❌ Invalid format. Use <index> <quantity> (e.g., 1 2) or type done to finish.");
                    }
                } else {
                    await sendMessage(from, "🤖 I didn't understand. Type menu to see options.");
                }
            }
        }
    }
    res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 WhatsApp bot running on port 3000"));
