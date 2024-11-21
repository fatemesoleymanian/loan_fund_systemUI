import jalaali from 'jalaali-js';

export function getJalaliDate() {
    const today = new Date();
    const jalaliDate = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());

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

