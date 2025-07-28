mod joke_tag;

use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

pub use joke_tag::JokeHandler;

use crate::Handler;

#[async_trait]
pub trait TagHandler: Send + Sync {
    fn should_handle(&self, msg: &Message) -> bool;

    async fn handle(&self, handler: &Handler, ctx: &Context, msg: &Message) -> Result<()>;
}

pub struct TagHandlerRegistry {
    handlers: Vec<Box<dyn TagHandler>>,
}

impl TagHandlerRegistry {
    pub fn new() -> Self {
        Self {
            handlers: Vec::new(),
        }
    }

    pub fn register<H: TagHandler + 'static>(&mut self, handler: H) {
        self.handlers.push(Box::new(handler));
    }

    pub async fn process_message(&self, handler: &Handler, ctx: &Context, msg: &Message) {
        for ch in &self.handlers {
            if ch.should_handle(msg) {
                if let Err(err) = ch.handle(handler, ctx, msg).await {
                    eprintln!("[ERROR] Error in tag handler: {err:?}");
                }
            }
        }
    }
}
