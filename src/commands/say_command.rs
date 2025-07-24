use serenity::{async_trait, model::channel::Message, prelude::*};

use super::{args, CommandHandler};

pub struct SayHandler;

impl SayHandler {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl CommandHandler for SayHandler {
    async fn handle(&self, ctx: &Context, msg: &Message) -> serenity::Result<()> {
        let args = args(msg);

        msg.channel_id
            .say(&ctx.http, args.join(" "))
            .await
            .map(|_| ())
    }
}
