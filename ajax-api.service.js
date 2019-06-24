/**
 * @typedef {object} ResponseJSONData - Формат ответа от сервера
 * @property {boolean} success - Успешен ли ответ
 * @property {object} [errors] - Объект ошибок, если success === false
 * @property {any} [data] - Данные от сервера, если success === true
 */

/**
 * Сервис для выполнения Ajax запросов с использованием XMLHttpRequest и последующим разбором ответа
 * @param url
 * @return {{post: (function(*, *): Promise<any | never>), get: (function(*): Promise<any | never>)}}
 * @constructor
 */
export function AjaxApiService(url) {

    /**
     * Выполнить запрос к серверу
     * @private
     * @param {'POST'|'GET'} method
     * @param {object} data
     * @param {object} params
     * @return {Promise<any | never>}
     */
    function doRequest({method, data, params}) {

        const urlWithParams = getUrlWithParams(url, params);

        return new Promise((resolve, reject) => {

            const request = new XMLHttpRequest();

            request.onload = request.onerror = function () {
                if (this.status === 200) {
                    resolve(request.response);
                } else {
                    reject();
                }
            };

            request.responseType = 'json';
            request.open(method, urlWithParams, true);
            request.send(data);

        }).then(/** @param {ResponseJSONData} data */ (data) => {
            /**
             * Первичный разбор ответа, чтобы дальше передать либо данные (success === true), либо пробросить ошибку
             */

            if (!data || !data.hasOwnProperty('success')) {
                throw new Error(`Invalid response on "${urlWithParams}" request`);
            }

            if (!data.success) {
                throw data.errors || {};
            }

            return data.data;
        });
    }

    /**
     * Сделать из объекта параметров строку запроса (сериализуем) вида "foo=1&bar=baz&qwer=-1"
     * @private
     * @param {object} params
     * @return {string}
     */
    function makeQueryFromParams(params) {
        return Object.keys(params)
            /**
             * Исключаем "Пустые" значения из запросов
             */
            .filter(key => !['', null, undefined].includes(params[key]))
            .map(key => `${key}=${params[key]}`)
            .join('&');
    }

    /**
     * Склеить адрес запроса с его параметрами, при наличии,
     * например: /foo/bar и параметры {bar: 'baz', qwer: 1} дадут адрес /foo/bar?bar=baz&qwer=1
     * @private
     * @param {string} basicUrl
     * @param {object} params
     * @return {string}
     */
    function getUrlWithParams(basicUrl, params) {
        return params ? basicUrl + '?' + makeQueryFromParams(params) : basicUrl;
    }

    /**
     * Выполнить POST запрос
     * @private
     * @param {object} data - Данные для отправки в теле запроса
     * @param {object} queryParams - Query параметры адреса запроса
     * @return {Promise<any | never>}
     */
    function post(data, queryParams) {
        return doRequest({
            method: 'POST',
            data,
            params: queryParams
        });
    }

    /**
     * Выполнить GET запрос
     * @private
     * @param {object} queryParams - Query параметры адреса запроса
     * @return {Promise<any | never>}
     */
    function get(queryParams) {
        return doRequest({
            method: 'GET',
            params: queryParams
        });
    }

    /**
     * Методы публичного API сервиса
     */
    return {
        get,
        post
    }
}
