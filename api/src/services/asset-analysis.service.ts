import { FeatureCollection, Geometry, Feature, Polygon, MultiPolygon, GeoJsonProperties } from 'geojson';
import { AssetLocationRequestDto } from '../models/asset-location-request.model';
import { DataProviderUtils } from '../utils/data-provider.utils';
import * as turf from '@turf/turf';
import { DataLayerDto } from '../models/data-layer.model';

/*
 * A service which provides access to analysis operations like location and suitability for different assets.
 */
export class AssetAnalysisService {
    constructor(private readonly dataProviderUtils: DataProviderUtils) {}

    private getMatchedPolygonsForLayer(
        layer: FeatureCollection<MultiPolygon>,
        location: Feature<Polygon>,
        suitability: string,
        issue?: string
    ): Feature<Polygon | MultiPolygon, GeoJsonProperties>[] {
        const matchedPolygons: Feature<Polygon | MultiPolygon, GeoJsonProperties>[] = [];
        layer.features.forEach((layerFeature) => {
            layerFeature.geometry.coordinates.forEach((position) => {
                const polygon = turf.polygon(position);
                const combinedFeatureCollection = { type: 'FeatureCollection', features: [location, polygon] } as FeatureCollection<Polygon>;
                const intersection = turf.intersect(combinedFeatureCollection);

                if (intersection) {
                    intersection.properties!.suitability = suitability;
                    if (issue) intersection.properties!.issue = issue;
                    matchedPolygons.push(intersection);
                }
            });
        });

        return matchedPolygons;
    }

    private getMatchedPolygonsForLayers(dataLayers: DataLayerDto[], location: Feature<Polygon>): Feature<MultiPolygon | Polygon, GeoJsonProperties>[] {
        let matchedPolygons: Feature<MultiPolygon | Polygon, GeoJsonProperties>[] = [];

        dataLayers.forEach((dataLayer) => {
            if (dataLayer.id === 'windSpeed') {
                const windspeedGoodLayer = this.dataProviderUtils.getWindspeedGoodLayerData();
                matchedPolygons = matchedPolygons.concat(this.getMatchedPolygonsForLayer(windspeedGoodLayer, location, 'green'));

                const windspeedBadLayerData = this.dataProviderUtils.getWindspeedBadLayerData();
                matchedPolygons = matchedPolygons.concat(this.getMatchedPolygonsForLayer(windspeedBadLayerData, location, 'red', 'Bad windspeed - < 4m/s'));
            } else if (dataLayer.id === 'specialAreasOfConservation') {
                const specialAreasOfConservationLayerData = this.dataProviderUtils.getSpecialAreasOfConservationLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(specialAreasOfConservationLayerData, location, 'red', 'Too close to special areas of conservation - < 1km')
                );

                const specialAreasOfConservation2KmLayer = this.dataProviderUtils.getSpecialAreasOfConservation2KmLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(specialAreasOfConservation2KmLayer, location, 'amber', 'Close to special areas of conservation - <= 2km')
                );
            } else if (dataLayer.id == 'siteOfSpecialScientificInterest') {
                const sitesOfSpecialScientificInterestLayerData = this.dataProviderUtils.getSitesOfSpecialScientificInterestLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        sitesOfSpecialScientificInterestLayerData,
                        location,
                        'red',
                        'Too close to Sites of Special Scientific Interest - < 1km'
                    )
                );

                const sitesOfSpecialScientificInterest2KmLayer = this.dataProviderUtils.getSitesOfSpecialScientificInterest2KmLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(
                        sitesOfSpecialScientificInterest2KmLayer,
                        location,
                        'amber',
                        'Close to Sites of Special Scientific Interest - <= 2km'
                    )
                );
            } else if (dataLayer.id === 'builtUpAreas') {
                const builtupAreasLayerData = this.dataProviderUtils.getBuiltupAreasLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(builtupAreasLayerData, location, 'red', 'Too close to Built up areas - < 1km')
                );

                const builtupAreas2KmLayerData = this.dataProviderUtils.getBuiltupAreas2KmLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(builtupAreas2KmLayerData, location, 'amber', 'Close to Built up areas - <= 2km')
                );
            } else if (dataLayer.id == 'areasOfOutstandingNaturalBeauty') {
                const areasOfNaturalBeautyLayerData = this.dataProviderUtils.getAreasOfNaturalBeautyLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(areasOfNaturalBeautyLayerData, location, 'red', 'Too close to Areas of Natural Beauty - < 1km')
                );

                const areasOfNaturalBeauty2KmLayerData = this.dataProviderUtils.getAreasOfNaturalBeauty2KmLayerData();
                matchedPolygons = matchedPolygons.concat(
                    this.getMatchedPolygonsForLayer(areasOfNaturalBeauty2KmLayerData, location, 'amber', 'Close to Areas of Natural Beauty - <= 2km')
                );
            }
        });

        return matchedPolygons;
    }
    /*
     * A method to analayze the location sent by the user along with the data layers they choose to include for analysis and return a number of polygons with a suitability rating for placing an asset.
     */
    public analyzeLocation(req: AssetLocationRequestDto): FeatureCollection<Geometry> {
        const locationPolygon = turf.polygon(req.location.features![0].geometry.coordinates);
        const dataLayersToBeAnalysed = req.dataLayers.filter((dataLayer) => dataLayer.analyze);

        const matchedPolygons = this.getMatchedPolygonsForLayers(dataLayersToBeAnalysed, locationPolygon);
        const featureCollection: FeatureCollection<Geometry> = {
            type: 'FeatureCollection',
            features: [...matchedPolygons],
        };

        return featureCollection;
    }
}
