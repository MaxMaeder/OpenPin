export const NO_SPEECH_MSGS = [
  "Sorry, I couldn't hear you. Can you repeat that?",
  "I didn't hear anything. Could you repeat that?",
];

export const getRandomCannedMsg = (msgList: string[]) => {
  const index = Math.floor(Math.random() * msgList.length);
  return msgList[index];
};
