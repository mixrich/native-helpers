/**
 * @typedef {object} ResponseJSONData - Формат ответа от сервера
 * @property {boolean} success - Успешен ли ответ
 * @property {object} [errors] - Объект ошибок, если success === false
 * @property {any} [data] - Данные от сервера, если success === true
 */


/**
 * Асинхронная загрузка файла на сервер
 * Реализовано через функцию, чтобы исплементировать приватные методы класса и его публичное API
 * @param {string} url
 * @return {{upload: upload, abort: abort}}
 * @constructor
 */
export function AjaxFileUploaderService(url) {

    /**
     * Объект запроса
     * @type {XMLHttpRequest}
     */
    const request = new XMLHttpRequest();

    /**
     * Выполнить загрузку на сервер
     * @private
     * @param formData - Данные формы для загрузки. Должно содержать file
     * @param {File} formData.file - файл для загрузки
     * @param {function} progressCallback - коллбек прогресса загрузки
     * @param {function} doneCallback - коллбек успешного окончания загрузки
     * @param {function} errorCallback - коллбек ошибки во время загрузки
     * @param {function} abortCallback - коллбек отмены загрузки
     */
    function upload({formData, progressCallback, doneCallback, errorCallback, abortCallback}) {

        request.onload = request.onerror = function () {
            if (this.status === 200) {
                /**
                 * @type {ResponseJSONData}
                 */
                const data = request.response;

                if (!data || !data.hasOwnProperty('success')) {
                    errorCallback(new Error(`Invalid response on "${url}" request`));
                    return;
                }

                if (!data.success) {
                    errorCallback(data.errors);
                } else {
                    doneCallback(data.data);
                }

            } else {
                errorCallback && errorCallback();
            }
        };

        if (abortCallback) {
            request.onabort = function () {
                abortCallback();
            };
        }

        if (progressCallback) {
            request.upload.onprogress = function(event) {
                const percentage = (event.loaded / event.total * 100).toFixed(2);
                progressCallback(percentage);
            };
        }

        request.responseType = 'json';
        request.open('POST', url, true);
        request.send(formData);
    }

    /**
     * Отменить загрузку
     * @private
     */
    function abort() {
        request.abort();
    }

    return {
        upload,
        abort
    }
}
