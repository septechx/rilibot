use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

use super::MessageHandler;

pub struct CommandHandler;

impl CommandHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl MessageHandler for CommandHandler {
    fn should_handle(&self, msg: &Message) -> bool {
        !msg.author.bot && msg.content.to_lowercase().starts_with("$")
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> serenity::Result<()> {
        let cmd: Vec<_> = msg.content.strip_prefix("$").unwrap().split(' ').collect();

        if !cmd.is_empty() {
            state
                .command_handlers
                .process_command(state, ctx, msg, &cmd[0].to_string())
                .await?;
        }

        Ok(())
    }
}
