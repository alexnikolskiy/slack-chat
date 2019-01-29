class SpeakCommand {
  constructor(message) {
    this.message = message;
    this.synth = window.speechSynthesis;
  }

  execute() {
    if (this.synth) {
      const utter = new SpeechSynthesisUtterance(this.message.text);

      this.synth.speak(utter);
    }
  }
}

export default SpeakCommand;
