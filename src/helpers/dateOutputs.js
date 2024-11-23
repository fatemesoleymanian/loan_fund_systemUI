import jalaali from 'jalaali-js';

export function getJalaliDate() {
    const today = new Date();
    const jalaliDate = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    console.log(today.getMon)

    const { jy, jm, jd } = jalaliDate; // jy = year, jm = month, jd = day
    return {year:jy , month:jm , day:jd};
}

export function jalaliToGregorian(jalaliDate) {
    const [jy, jm, jd] = jalaliDate.split('-').map(Number);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
}

export function gregorianToJalali(gregorianDate) {
    const [gy, gm, gd] = gregorianDate.split('-').map(Number);
    const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
    return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
}

export function persianDateTime() {
  const d = new Date()
  const getParts = () => d.toLocaleDateString().split('/')
  const getPersianParts = () => d.toLocaleDateString('fa-IR').split('/')
  return {
    toLocaleDateString: () => d.toLocaleDateString('fa-IR-u-nu-latn'),
    getParts,
    getDay: () => d.getDay() === 6 ? 0 : d.getDay() + 1,
    getDate: () => getParts()[2],
    getMonth: () => getParts()[1] - 1,
    getYear: () => getParts()[0],
    getPersianYear: () => getPersianParts()[0],
    getPersianMonth: () => getPersianParts()[1],
    getPersianDay: () => getPersianParts()[2],
    getMonthName: () => d.toLocaleDateString('fa-IR', { month: 'long' }),
    getDayName: () => d.toLocaleDateString('fa-IR', { weekday: 'long' })
  }
}
