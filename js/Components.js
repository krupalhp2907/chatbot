/**
 * Components.js for dynamic DOM elements 
*/

// Conversation Header
const ConversationHeader = props => {
    const { username: dataSource } = props;
    if (dataSource == "bot") {
        const htmlString = `
            <div class="conversation" data-source="bot">
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
            </div>`;
        return createElementFromHTML(htmlString);
    } else {
        const htmlString = `
            <div class="conversation" data-source="user">
                <div class="conversation-header conversation-header-user">
                    <div class="conversation-header-name">
                    You
                    </div>
                </div>
            </div>`;
        return createElementFromHTML(htmlString);
    }
};

// conversation Object
const ConversationMessage = (props) => {
    const { messageObj, handleButtonClick } = props;
    const { username, uuid, message, error } = messageObj;
    const dataSource = username == "bot" ? "bot" : "user";


    // to use dom properties such as event listners always use create Element 
    const Message = (message) => {

        switch (message.type) {

            case "text":
                // create text message element
                let htmllString = `
                        <div class="conversation" data-source="${dataSource}" data-uuid="${uuid}">
                            <div class="conversation-message">
                                <div class="conversation-list-item">
                                    <div class="conversation-text">
                                        ${message.text}
                                    </div>
                                </div>
                            </div>
                        </div>`;

                return createElementFromHTML(htmllString);


            case "button":
                // create button message element
                let conversationQuickReplyWrapperEl = createElementFromHTML(` 
                <div class="conversation" data-source="${dataSource}" data-uuid="${uuid}">
                    <div class="conversation-message">
                        <div class="conversation-quick-reply-wrapper"></div>
                    </div>
                </div>
                `);

                for (let i in message.buttons) {
                    const { title, payload } = message.buttons[i];
                    // create conversation button element
                    let conversationButtonEl = createElementFromHTML(`
                                                    <div class="conversation-button">
                                                        <span>${title}</span>
                                                    </div>
                                                `);

                    conversationButtonEl.addEventListener("click", () => handleButtonClick(payload, title));
                    conversationQuickReplyWrapperEl.querySelector(".conversation-quick-reply-wrapper").appendChild(conversationButtonEl);
                }
                return conversationQuickReplyWrapperEl;

            default:
                break;
        }
    }

    return Message(message);
}

// Loader
const Loader = () => {
    return createElementFromHTML(`
        <div class="conversation" data-source="bot">
            <div class="conversation-message">
                <div class="ticontainer loading">
                    <div class="tiblock">
                        <div class="tidot"></div>
                        <div class="tidot"></div>
                        <div class="tidot"></div>
                    </div>
                </div>
            </div>
        </div>
    `
    );
};

// coversation error message
const ConversationErrorMessage = () => {
    return createElementFromHTML(`<span class="conversation-header-error-message">( Message
        Failed to send )</span>`);
}