mod say_command;

use serenity::{async_trait, model::channel::Message, prelude::*};

use std::collections::HashMap;

pub use say_command::SayHandler;

#[async_trait]
pub trait CommandHandler: Send + Sync {
    async fn handle(&self, ctx: &Context, msg: &Message) -> serenity::Result<()>;
}

pub struct CommandHandlerRegistry {
    handlers: HashMap<&'static str, Box<dyn CommandHandler>>,
}

impl CommandHandlerRegistry {
    pub fn new() -> Self {
        Self {
            handlers: HashMap::new(),
        }
    }

    pub fn register<H: CommandHandler + 'static>(&mut self, name: &'static str, handler: H) {
        self.handlers.insert(name, Box::new(handler));
    }

    pub async fn process_command(
        &self,
        ctx: &Context,
        msg: &Message,
        name: &String,
    ) -> serenity::Result<()> {
        match self.handlers.get(name.as_str()) {
            Some(handler) => {
                if let Err(err) = handler.handle(ctx, msg).await {
                    eprintln!("Error in command handler {name}: {err:?}");
                }
            }
            None => {
                eprintln!("Command not found: {name}");
            }
        };

        Ok(())
    }
}

pub fn args(msg: &Message) -> Vec<&str> {
    let parts: Vec<_> = msg.content.strip_prefix("$").unwrap().split(' ').collect();
    parts[1..].to_vec()
}
