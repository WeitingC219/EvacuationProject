export const timeConverter = (unixTimestamp) => {
  const a = new Date(Number(unixTimestamp));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours() < 10 ? `0${a.getHours().toString()}` : a.getHours();
  const min = a.getMinutes() < 10 ? `0${a.getMinutes().toString()}` : a.getMinutes();
  const sec = a.getSeconds() < 10 ? `0${a.getSeconds().toString()}` : a.getSeconds();
  const time = `${year} ${month} ${date} ${hour}:${min}:${sec}`;
  return time;
};

export const timeConverterHMS = (unixTimestamp) => {
  const a = new Date(Number(unixTimestamp));
  const hour = a.getHours() < 10 ? `0${a.getHours().toString()}` : a.getHours();
  const min = a.getMinutes() < 10 ? `0${a.getMinutes().toString()}` : a.getMinutes();
  const sec = a.getSeconds() < 10 ? `0${a.getSeconds().toString()}` : a.getSeconds();
  const time = `${hour}:${min}:${sec}`;
  return time;
};
