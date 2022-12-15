import { OteosCacheService, OteosTranslateService } from 'oteos-components-lib';
import { Component, OnInit } from '@angular/core';
import { New } from '../../model/new';

@Component({
  selector: 'app-news-letter',
  templateUrl: './news-letter.component.html',
  styleUrls: ['./news-letter.component.scss']
})
export class NewsLetterComponent implements OnInit {

  public new1: New;
  public new2: New;
  public new3: New;
  public new4: New;

  public news: New[];

  constructor(
    public readonly cacheService: OteosCacheService,
    public readonly translateService: OteosTranslateService,
  ) { 
    this.cacheService.setElement("title", this.translateService.getTranslate('label.news-letter.cache.title'));

    this.new1 = new New();
    this.new2 = new New();
    this.new3 = new New();
    this.new4 = new New();
    
    this.news = [];
  }

  ngOnInit() {
    this.new1.title = 'El negocio de vender balas ecológicas por todo el mundo';
    this.new1.text1 = 'Cazar animales sin contaminar el planeta. Este es el negocio de BioAmmo, una empresa instalada en un municipio de Segovia de apenas 1.000 habitantes que exporta sus balas ecológicas por todo el mundo. ';
    this.new1.text2 = 'Su fundador acaba de recibir la Gran Cruz al Mérito Agrario, un reconocimiento con el que solo cuentan once personas en España. Su actividad consiste en fabricar munición biodegradable gracias a ocho patentes de cartuchos no contaminantes. ';
    this.new1.imgSrc = 'https://s1.eestatic.com/2022/11/18/invertia/empresas/719438549_228814155_1706x960.jpg';

    this.new2.title = 'China envía un número récord de bombarderos nucleares a la zona de defensa aérea de Taiwán';
    this.new2.text1 = 'China envió un récord de 18 bombarderos con capacidad nuclear a la zona de defensa aérea de Taiwán, han informado este martes las autoridades de esta isla con un gobierno democrático propio que Pekín considera como parte de su territorio.';
    this.new2.text2 = 'El país comunista aumentó la presión militar, diplomática y económica sobre Taiwán desde la elección en 2016 de la presidenta de Tsai Ing-wen, que rechaza que la isla sea parte del gigante asiático.';
    this.new2.imgSrc = 'https://theobjective.com/wp-content/uploads/2022/12/Bombarderos-caza-china-654x368.jpg';

    this.new3.title = 'Un documento de Defensa alerta de la dificultad para reclutar militares la próxima década';
    this.new3.text1 = 'Un documento del Ministerio de Defensa alerta de las dificultades que pueden encontrar las Fuerzas Armadas en la próxima década para el reclutamiento de nuevos militares, así como para su retención debido a la competencia con el mercado laboral civil.';
    this.new3.text2 = 'Así lo incluye el informe ‘Entorno Operativo 2035’, redactado por el CESEDEN y prologado por el propio Jefe de Estado Mayor de la Defensa, almirante general Teodoro López Calderón, que recoge este domingo Europa Press. El texto se encarga de analizar el contexto en el que deberán desenvolverse las Fuerzas Armadas en el año 2035 y los cambios que tendrán que acometer para estar preparadas para ese nuevo escenario.';
    this.new3.imgSrc = 'https://theobjective.com/wp-content/uploads/2022/12/militares-informe-654x368.jpg';

    this.new4.title = 'La venta de armas sigue disparada en Estados Unidos';
    this.new4.text1 = 'La venta de armas en Estados Unidos, que se disparó el pasado año a raíz del inicio de la pandemia del coronavirus, continúa creciendo, con una quinta parte de las compras a cargo de personas que se estrenan como propietarios, según datos preliminares de un estudio publicados este domingo por The New York Times.';
    this.new4.text2 = 'Las cifras, recopiladas por la Northeastern University y un centro de investigación de Harvard, señalan que cada vez hay más armas en circulación, y también más y más personas armadas.';
    this.new4.imgSrc = 'https://img.asmedia.epimg.net/resizer/giQI9ydJNqKdkNKz7jnGbklMqTs=/1952x1098/filters:focal(532x216:542x226)/cloudfront-eu-central-1.images.arcpublishing.com/diarioas/CZ67DFZYFVKXHOZHIJUA7277Q4.jpg';

    this.news.push(this.new1);
    this.news.push(this.new2);
    this.news.push(this.new3);
    this.news.push(this.new4);
  }

}
