function getTargetDateFromWeekDay(weekDay: string): Date {
  const weekDayToNumber: Record<string, number> = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  const today = new Date();
  const todayIndex = today.getDay();
  const targetIndex = weekDayToNumber[weekDay];
  
  const targetDate = new Date(today);
  
  if (targetIndex <= todayIndex) {
    targetDate.setDate(today.getDate() - (todayIndex - targetIndex));
  } else {
    targetDate.setDate(today.getDate() - (7 - (targetIndex - todayIndex)));
  }
  
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
}

export { getTargetDateFromWeekDay }