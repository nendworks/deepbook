import scrapy

class SuumoSpider(scrapy.Spider):
    name = 'suumo_shibuya'
    allowed_domains = ['suumo.jp']
    start_urls = [
      'http://suumo.jp/jj/chintai/ichiran/FR301FC001/?ar=030&bs=040&ra=013&cb=0.0&ct=9999999&et=9999999&cn=9999999&mb=0&mt=9999999&shkr1=03&shkr2=03&shkr3=03&shkr4=03&fw2=&ek=000517640&rn=0005&pn=2',
    ]

    def parse(self, response):
        next_selector = response.xpath("//p[@class='pagination-parts']//@href")
        for url in next_selector.extract():
            yield scrapy.Request(response.urljoin(url), callback=self.parse)
        def extract_with_xpath(query):
            return response.xpath(query).extract_first().strip().strip('m').strip('万円')

        for table in response.css('table.cassetteitem_other'):
            yield {
                'price' : extract_with_xpath('//span[@class="cassetteitem_other-emphasis ui-text--bold"]/text()'),
                'space' : extract_with_xpath('//sup/parent::node()/text()'),
            }
