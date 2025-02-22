import {assert, expect} from '../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import CourseEditor from '@cdo/apps/templates/courseOverview/CourseEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {Provider} from 'react-redux';

const defaultProps = {
  name: 'csp',
  title: 'Computer Science Principles 2017',
  familyName: 'CSP',
  versionYear: '2017',
  visible: false,
  isStable: false,
  descriptionShort: 'Desc here',
  descriptionStudent: 'Desc here',
  descriptionTeacher: 'Desc here',
  scriptsInCourse: ['CSP Unit 1', 'CSP Unit 2'],
  scriptNames: ['CSP Unit 1', 'CSP Unit 2'],
  teacherResources: [],
  hasVerifiedResources: false,
  courseFamilies: ['CSP', 'CSD', 'CSF'],
  versionYearOptions: ['2017', '2018', '2019']
};

describe('CourseEditor', () => {
  beforeEach(() => {
    stubRedux();
    registerReducers({teacherSections});
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={getStore()}>
        <CourseEditor {...combinedProps} />
      </Provider>
    );
  };

  it('renders full course editor page', () => {
    const wrapper = createWrapper({});
    assert.equal(wrapper.find('textarea').length, 3);
    assert.equal(wrapper.find('CourseScriptsEditor').length, 1);
    assert.equal(wrapper.find('ResourcesEditor').length, 1);
    assert.equal(wrapper.find('CourseOverviewTopRow').length, 1);
  });

  describe('VisibleInTeacherDashboard', () => {
    it('is unchecked when visible is false', () => {
      const wrapper = createWrapper({});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.false;
    });

    it('is checked when visible is true', () => {
      const wrapper = createWrapper({visible: true});
      const checkbox = wrapper.find('input[name="visible"]');
      expect(checkbox.prop('checked')).to.be.true;
    });
  });
});
