use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{args_checked, send_error, CommandHandler};

use crate::Handler;

pub struct HelpHandler;

impl HelpHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for HelpHandler {
    fn get_usage(&self) -> &'static str {
        "$help command"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> serenity::Result<()> {
        let usage_s = self.get_usage();
        let args = match args_checked(ctx, msg, 1, usage_s).await {
            Ok(a) => a,
            Err(_) => return Ok(()),
        };

        let cmd = args[0];
        let help = match state.command_handlers.handlers.get(cmd) {
            Some(ch) => ch.get_usage(),
            None => {
                send_error(ctx, msg, &format!("Command not found: {cmd}")).await?;
                return Ok(());
            }
        };

        msg.channel_id.say(&ctx.http, help).await.map(|_| ())
    }
}
