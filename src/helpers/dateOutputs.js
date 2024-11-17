import jalaali from 'jalaali-js';

export function getJalaliDate() {
    const today = new Date();
    const jalaliDate = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const { jy, jm, jd } = jalaliDate; // jy = year, jm = month, jd = day
    return {year:jy , month:jm , day:jd};
}
