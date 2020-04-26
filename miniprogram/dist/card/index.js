import { VantComponent } from '../common/component';
VantComponent({
    classes: [
        'desc-class',
        'thumb-class',
        'title-class',
    ],
    props: {
        desc: String,
        thumb: String,
        title: String,
        centered: Boolean,
        lazyLoad: Boolean,
        thumbMode: {
            type: String,
            value: 'aspectFit'
        }
    }
});
