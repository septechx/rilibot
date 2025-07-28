mod command_handler;
mod otro_handler;
mod tag_handler;

use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

pub use command_handler::CommandHandler;
pub use otro_handler::OtroHandler;
pub use tag_handler::TagHandler;

#[async_trait]
pub trait MessageHandler: Send + Sync {
    fn should_handle(&self, msg: &Message) -> bool;

    async fn handle(&self, handler: &Handler, ctx: &Context, msg: &Message) -> Result<()>;
}

pub struct MessageHandlerRegistry {
    handlers: Vec<Box<dyn MessageHandler>>,
}

impl MessageHandlerRegistry {
    pub fn new() -> Self {
        Self {
            handlers: Vec::new(),
        }
    }

    pub fn register<H: MessageHandler + 'static>(&mut self, handler: H) {
        self.handlers.push(Box::new(handler));
    }

    pub async fn process_message(&self, handler: &Handler, ctx: &Context, msg: &Message) {
        for ch in &self.handlers {
            if ch.should_handle(msg) {
                if let Err(err) = ch.handle(handler, ctx, msg).await {
                    eprintln!("[ERROR] Error in message handler: {err:?}");
                }
            }
        }
    }
}
