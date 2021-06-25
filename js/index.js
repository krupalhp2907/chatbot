const chatbotBodyEl = document.querySelector(".bot>.body");
const username = "krupal";
const sendMessageFormEl = document.querySelector(".bot>.footer>#sendMessageForm");
const sendMessageInputEl = document.getElementById("sendMessage");

var conversation = [];

const createMessageObjForEl = (message, username = "bot", error = false) => {
    return {
        message,
        username,
        error: error,
        uuid: uuidv4(),
    };
}

// Helper function that helps in scroll
const addMessageScrollHelper = el => {
    // check if element should scroll must be before pushing element to dom
    const shouldScroll = checkShouldScroll(chatbotBodyEl);

    /**
     * Add user message
     */
    chatbotBodyEl.appendChild(el);

    // scroll to bottom
    if (shouldScroll) {
        scrollToBottom(chatbotBodyEl);
    }
}

const addMessage = (messageObj) => {
    const conversationObj = {
        ...messageObj
    }

    const dataSource = messageObj.username === "bot" ? "bot" : "user";

    // check if chatbotBodyEl has no child
    if (chatbotBodyEl.childNodes.length === 0 || conversation.length === 0) {
        // then add appropriate title 
        chatbotBodyEl.appendChild(ConversationHeader(messageObj));
    } else if (
        // get data-source attribute and check is user changes
        // lastElement cannot be empty
        chatbotBodyEl.lastElementChild.getAttribute("data-source") != dataSource
    ) {
        // then add appropriate title
        chatbotBodyEl.appendChild(ConversationHeader(messageObj));
    }

    // Get conversation message element component
    const conversationEl = ConversationMessage({
        messageObj: conversationObj,
        handleButtonClick: sendMessageHandler,
    });

    addMessageScrollHelper(conversationEl);

    conversation.push(conversationObj);

    return conversationEl;
}

const scrollToBottom = (el) => {
    if (el instanceof Element) {
        el.scrollTop = el.scrollHeight;
    }
}

const checkShouldScroll = (el) => {
    return el.scrollTop + el.clientHeight <= el.scrollHeight;
}

const parseMessages = (messages) => {

    const supportedMessageType = ["image", "text", "buttons", "attachment", "custom"];
    let messagesList = [];

    messages
        .filter(message => supportedMessageType.some(type => type in message))
        .forEach(message => {
            let isMessageValid = false;
            if (message.text) {
                isMessageValid = true;
                messagesList.push(createMessageObjForEl({ type: "text", text: message.text }));
            }

            if (message.image) {
                isMessageValid = true;
                messagesList.push(createMessageObjForEl({ type: "text", text: message.image }));
            }

            if (message.buttons) {
                isMessageValid = true;
                messagesList.push(createMessageObjForEl({ type: "button", buttons: message.buttons }));
            }

            // probably should be handled with special UI elements
            if (message.attachment) {
                isMessageValid = true;
                console.log("Attachment");
            }

            if (!isMessageValid) throw Error("Cannot parse message");
        });

    // Show Bot message on UI
    messagesList.forEach(message => addMessage(message));
}

const handleMessageError = (uuid) => {

    // edit conversation message element
    let message_idx = undefined;
    for (let i in conversation) {
        if (conversation[i].uuid == uuid) {
            message_idx = i;
            conversation[i].error = true;
            break;
        }
    }

    if (message_idx) {
        const messageEl = document.querySelector(`[data-uuid="${uuid}"]`);
        messageEl.firstElementChild.appendChild(ConversationErrorMessage());
    }

}

const sendMessage = async (payload) => {
    if (payload === "") return;


    const rasaMessageObj = Object.freeze({
        message: payload,
        sender: username
    });

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

    // remove loading animation
    chatbotBodyEl.removeChild(chatbotBodyEl.lastChild);

    // parse chatbot message
    parseMessages(messages);
}

const sendMessageHandler = (payload, messageText) => {

    if (messageText == undefined) messageText = payload;
    // add user message to UI
    const messageObj = createMessageObjForEl({
        type: "text",
        text: messageText
    }, username);

    addMessage(messageObj);

    // Add Loading animation
    addMessageScrollHelper(Loader());


    sendMessageInputEl.disabled = true;
    sendMessageInputEl.value = "";
    sendMessage(payload)
        .then(suss => {
            sendMessageInputEl.disabled = false;
            sendMessageInputEl.focus();
        })
        .catch(err => {
            sendMessageInputEl.disabled = false;
            sendMessageInputEl.focus();
            // remove loading animation
            chatbotBodyEl.removeChild(chatbotBodyEl.lastChild);
            handleMessageError(messageObj.uuid);
        });
}


// application init function
((window) => {
    // add default message
    const defaultChatbotMessage = {
        messages: [{
            type: "text",
            text: "Hello! How may I help you ?"
        }],
        time: Date.now(),
        username: "bot",
        uuid: uuidv4()
    };

    // check older messages if any 
    scrollToBottom(chatbotBodyEl);

    // now add smooth scroll 
    chatbotBodyEl.setAttribute("style", "scroll-behavior: smooth;");

    // add event listners
    sendMessageFormEl.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = String(e.target.sendMessage.value);
        sendMessageHandler(message);
    });
})(window);