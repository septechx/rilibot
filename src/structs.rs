use serenity::{async_trait, model::channel::Message, prelude::*};

use crate::Handler;

#[async_trait]
pub trait Hook: Send + Sync {
    async fn run(&self, state: &Handler, ctx: &Context, msg: &Message) -> bool;
}
