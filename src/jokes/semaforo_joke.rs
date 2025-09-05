use crate::jokes::Joke;

pub struct SemaforoJoke;

impl SemaforoJoke {
    pub fn new() -> Self {
        Self
    }
}

impl Joke for SemaforoJoke {
    fn get_joke(&self) -> String {
        "Que le dice un semaforo al otro?".to_string()
    }

    fn get_responses(&self) -> Vec<String> {
        vec!["No me mires que me estoy cambiando".to_string()]
    }
}
