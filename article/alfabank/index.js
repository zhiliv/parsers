/**
 * Модуль для парсинга статей Альфабанк
 * @module alfabank-article
 */
'use strict';
let organization = 'Альфа-Банк'
//подкобчение парсера
const puppeteer = require('puppeteer');
//библиотека для работы с ожиданиями
const q = require('q');
//библиотека для работы с асинхронными функциями
const async = require('async');
//библиотека автопролистывание страницы в низ
const scrollPageToBottom = require('puppeteer-autoscroll-down')

/**
 * Получениме заголовков статей и ссылки для перехода
 * @function getListTitleURL
 * @async
 * @returns {Object}
 */
var start = () => {
	//создание ожидания
	let defer = q.defer();
	//массив для хранения списка заголовков и ссылки на страницу
	let resultArr = [];
	//запуск браузера
	puppeteer.launch().then(async browser => {
		//создание вкладки
		const page = await browser.newPage();
		//открытие страницы
		await page.goto('https://learn.alfabank.ru/articles');
		//добалвение на страницу jquery
    await page.addScriptTag({ path: require.resolve('jquery') });
    await page.addScriptTag({ path: require.resolve('async') });
    await scrollPageToBottom(page)
		//Получение списка статей
		const list = await page.evaluate(async () => {
			//определение jquery
      const $ = window.$;
      let arr = []
      $('.article_item_block').each((ind, row) => {
        let obj = {title: null, url: null}
        obj.title = $(row).find('span').find('span').text()
        obj.url = $(row).attr('href')
        arr.push(obj)
      })
			return arr;
		});
    await async.eachOfSeries(list, async(row, ind) => {
      await page.goto(row.url);
      //добалвение на страницу jquery
      await page.addScriptTag({ path: require.resolve('jquery') });
      await page.addScriptTag({ path: require.resolve('async') });
      const description = await page.evaluate(async () => {
        //определение jquery
        const $ = window.$;
          let description =  $('.news_detail_content .format').html()
        return description;
      });
      row.description = description;
      row.organization = organization;
      resultArr.push(row)
    })
		//объект для хранения свойств страницы
    defer.resolve(resultArr)
		// other actions...
    await browser.close();
    return defer.promise;
	});
};

module.exports = async () => {
	start();
};
