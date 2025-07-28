use std::fmt::Debug;

use log::info;

pub fn hook(name: &str, state: impl Debug) {
    info!("Hook {name} with state {state:?} called");
}

pub fn handler(name: &str) {
    info!("Handler {name} called");
}

pub fn command(name: &str) {
    info!("Command {name} called");
}
