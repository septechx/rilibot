use serenity::{async_trait, model::channel::Message, prelude::*};

mod otro_handler;
pub use otro_handler::OtroHandler;

/// Trait for message handlers that can process Discord messages
#[async_trait]
pub trait MessageHandler: Send + Sync {
    /// Returns true if this handler should process the given message
    fn should_handle(&self, msg: &Message) -> bool;

    /// Process the message and optionally send a response
    async fn handle(&self, ctx: &Context, msg: &Message) -> serenity::Result<()>;
}

/// Registry that manages all message handlers
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

    pub async fn process_message(&self, ctx: &Context, msg: &Message) {
        for handler in &self.handlers {
            if handler.should_handle(msg) {
                if let Err(err) = handler.handle(ctx, msg).await {
                    eprintln!("Error in message handler: {err:?}");
                }
            }
        }
    }
}
