/**
 * Returns a dynamic greeting string based on the current local hour:
 * 04:00 - 11:59 -> "Good Morning"
 * 12:00 - 16:59 -> "Good Afternoon"
 * 17:00 - 21:59 -> "Good Evening"
 * 22:00 - 03:59 -> "Good Night"
 */
export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();

  if (hour >= 4 && hour < 12) {
    return "Good Morning";
  }
  if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  }
  if (hour >= 17 && hour < 22) {
    return "Good Evening";
  }
  return "Good Night";
};
