const chatbotBodyEl = document.querySelector(".bot>.body");
const username = "krupal";
const sendMessageFormEl = document.querySelector(".bot>.footer>#sendMessageForm");
const sendMessageInputEl = document.getElementById("sendMessage");

const defaultChatbotMessage = {
    messages: [{
        type: "text",
        text: "Hello! How may I help you ?"
    }],
    time: Date.now(),
    username: "bot",
    uuid: uuidv4()
};

var conversation = [];

const createConversationEl = (messageObj) => {

    const dataSource = messageObj.username == "bot" ? "bot" : "user";

    const header = ((dataSource) => {
        if (dataSource == "bot") {
            return `
            <div class="conversation-header">
                <div class="conversation-header-image">
                    <div class="bot-image-wrapper">
                        <div class="bot-image">
                            <img src="./img/mc-logo.svg" />
                        </div>
                    </div>
                </div>
                <div class="conversation-header-name">ODS Chatbot</div>
            </div>
            `;
        } else {
            return `
            <div class="conversation-header conversation-header-user">
                <div class="conversation-header-name">You</div>
            </div>
            `;
        }
    })(dataSource);

    const conversationListItems = ((messages) => {
        let messagesListEl = "";
        messages.forEach(message => {
            switch (message.type) {
                case "text":
                    messagesListEl += `<div class="conversation-list-item">
                    <div class="conversation-text">${message.text}</div>
                </div>`;
                default:
                    break;
            }
        });
        return messagesListEl;
    })(messageObj.messages);

    return `
    <div class="conversation" data-source="${dataSource}">

        ${header}

        <div class="conversation-list">
        
            ${conversationListItems}
        </div>
    </div>`;
}

const addMessage = (messageObj) => {
    const conversationObj = {
        ...messageObj
    }
    // note conversation array length is alwyas > 0 for this prototype
    if (
        conversation.length > 0 &&
        chatbotBodyEl.lastElementChild != null &&
        conversation[conversation.length - 1].username == messageObj.username
    ) {

        // edit the last node
        conversationObj.messages = conversation[conversation.length - 1].messages.concat(messageObj.messages);
        conversation.pop();
        console.log(conversation);
        chatbotBodyEl.removeChild(chatbotBodyEl.lastChild);
    }
    // create new node and append to dom
    chatbotBodyEl.innerHTML += createConversationEl(conversationObj);
    // scroll to bottom
    // remaining
    conversation.push(conversationObj);
}


const parseMessages = (messages) => {

    const supportedMessageType = ["image", "text", "buttons"];
    let messagesList = [];

    messages
        .filter(message => supportedMessageType.some(type => type in message))
        .forEach(message => {
            let isMessageValid = false;
            if (message.text) {
                isMessageValid = true;
                messagesList.push({
                    type: "text",
                    text: message.text
                });
            }

            if (message.image) {
                isMessageValid = true;
                messagesList.push({
                    type: "text",
                    text: message.image
                });
            }

            if (!isMessageValid) throw Error("Cannot parse message");
        });

    addMessage({
        messages: messagesList,
        time: Date.now(),
        username: "bot",
        uuid: uuidv4()
    });
}


const sendMessage = async (messageText) => {
    if (messageText === "") return;

    // currently only support of single text inputs
    const messageObj = {
        messages: [{ type: "text", text: messageText }],
        time: Date.now(),
        username,
        uuid: uuidv4()
    };

    // add user message to UI
    addMessage(messageObj);

    const rasaMessageObj = {
        message: messageObj.messages[0].text,
        sender: messageObj.username
    };

    const response = await fetch(
        "http://localhost:5005/webhooks/rest/webhook",
        {
            method: "POST",
            body: JSON.stringify(rasaMessageObj),
            headers: {
                "Content-Type": "application/json"
            }
        }
    )

    const messages = await response.json();

    // parse chatbot message
    parseMessages(messages);
}

const sendMessageHandler = (e) => {
    e.preventDefault();
    const message = String(e.target.sendMessage.value);
    sendMessage(message);
}


// application init function
((window) => {
    // add default message
    addMessage(defaultChatbotMessage);

    // add event listners
    sendMessageFormEl.addEventListener("submit", sendMessageHandler);
})(window);