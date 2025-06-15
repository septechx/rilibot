use std::env;

use serenity::{
    async_trait,
    model::{channel::Message, gateway::Ready},
    prelude::*,
};

mod handlers;
use handlers::{MessageHandlerRegistry, OtroHandler};

struct Handler {
    message_handlers: MessageHandlerRegistry,
}

impl Handler {
    fn new() -> Self {
        let mut registry = MessageHandlerRegistry::new();
        registry.register(OtroHandler::new());
        // Add more handlers here as needed

        Self {
            message_handlers: registry,
        }
    }
}

#[async_trait]
impl EventHandler for Handler {
    async fn message(&self, ctx: Context, msg: Message) {
        self.message_handlers.process_message(&ctx, &msg).await;
    }

    async fn ready(&self, _: Context, ready: Ready) {
        println!("{} is connected!", ready.user.name);
    }
}

#[tokio::main]
async fn main() {
    let token = env::var("DISCORD_TOKEN").expect("Expected a token in the environment");

    let intents = GatewayIntents::GUILD_MESSAGES
        | GatewayIntents::DIRECT_MESSAGES
        | GatewayIntents::MESSAGE_CONTENT;

    let mut client = Client::builder(&token, intents)
        .event_handler(Handler::new())
        .await
        .expect("Err creating client");

    if let Err(err) = client.start().await {
        println!("Client error: {err:?}");
    }
}
