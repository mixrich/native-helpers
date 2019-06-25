/**
 * Преобразовать размер в байтах в читаемую строку
 * @param {number} sizeInBytes
 * @returns {string} - Например, "24 Kb" или "456.12 Mb"
 */
export function bytes2string(sizeInBytes) {
    const grades = ['Kb', 'Mb', 'Gb'];

    let size = sizeInBytes;
    let sizeLabel = '';

    grades.some((grade, index) => {
        size = +(+size / 1024).toFixed(2);
        if (index === 0) {
            size = Math.ceil(size);
        }
        sizeLabel = `${size} ${grade}`;
        return size < 500;
    });

    return sizeLabel;
}