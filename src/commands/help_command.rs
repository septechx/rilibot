use anyhow::Result;
use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{CommandHandler, args, send_error, usage};

use crate::Handler;

pub struct HelpCommand;

impl HelpCommand {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for HelpCommand {
    fn get_usage(&self) -> &'static str {
        "$help (command)"
    }

    async fn handle(&self, state: &Handler, ctx: &Context, msg: &Message) -> Result<()> {
        let usage_s = self.get_usage();
        let args = args(msg);

        match args.len() {
            0 => {
                let cmds = state
                    .command_handlers
                    .handlers
                    .values()
                    .map(|ch| ch.get_usage())
                    .collect::<Vec<_>>()
                    .join("\n");

                msg.channel_id
                    .say(&ctx.http, format!("**Commands:**\n{cmds}"))
                    .await?;
            }
            1 => {
                let cmd = args[0];
                let help = match state.command_handlers.handlers.get(cmd) {
                    Some(ch) => ch.get_usage(),
                    None => {
                        send_error(ctx, msg, &format!("Command not found: {cmd}")).await?;
                        return Ok(());
                    }
                };

                msg.channel_id.say(&ctx.http, help).await?;
            }
            2.. => {
                msg.channel_id.say(&ctx.http, usage(usage_s)).await?;
            }
        }

        Ok(())
    }
}
