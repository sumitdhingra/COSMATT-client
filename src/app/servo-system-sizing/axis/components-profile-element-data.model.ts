import { ProfileElementsCollection } from '../shared/models/profile-element-list.model';

export class ComponentsProfileElementData {
    motionType: ProfileElementsCollection =  new ProfileElementsCollection();
    motionProfile: ProfileElementsCollection =  new ProfileElementsCollection();
    rotaryLoad: ProfileElementsCollection =  new ProfileElementsCollection();
    linearLoad: ProfileElementsCollection =  new ProfileElementsCollection();
    transmission: ProfileElementsCollection =  new ProfileElementsCollection();
    solutionAnalysis: ProfileElementsCollection =  new ProfileElementsCollection();
    summary: ProfileElementsCollection =  new ProfileElementsCollection();
}
