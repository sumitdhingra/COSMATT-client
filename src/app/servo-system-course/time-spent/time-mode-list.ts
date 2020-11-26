// Contains the time mode list to be used in jQuery flot chart in TimeSpentComponent
// It will be used in flotOptions of flot
export const TIME_MODE_LIST = {
  //Commenting for dummyData
  'lastYear': {
    'displayName': 'Last year',
    'interval': 'month',
    'flotOptions': {
      'tickSize': [1, 'month'],
      'timeformat': '%b',
      yaxis: {
        yAxisValueType: '',
        axisLabel: ''
      }
    }
  },
  // 'sixMonths': {
  //   'displayName': '6 months',
  //   'interval': 'month',
  //   'flotOptions': {
  //     'tickSize': [1, 'month'],
  //     'timeformat': '%b',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  // 'threeMonths': {
  //   'displayName': '3 months',
  //   'interval': 'month',
  //   'flotOptions': {
  //     'tickSize': [1, 'month'],
  //     'timeformat': '%b',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  'lastMonth': {
    'displayName': 'Last month',
    'interval': 'day',
    'flotOptions': {
      'tickSize': [1, 'day'],
      'timeformat': '%d',
      yaxis: {
        yAxisValueType: '',
        axisLabel: ''
      }
    },
    'flotOptions_smallResolution': {
      'tickSize': [2, 'day'],
      'timeformat': '%d'
    }
  },
  // 'sevenDays': {
  //   'displayName': '7 days',
  //   'interval': 'day',
  //   'flotOptions': {
  //     'tickSize': [1, 'day'],
  //     'timeformat': '%a',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  // 'twoDays': {
  //   'displayName': '2 days',
  //   'interval': 'hour',
  //   'flotOptions': {
  //     'tickSize': [4, 'hour'],
  //     'timeformat': '%I %p',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   },
  //   'flotOptions_smallResolution': {
  //     'tickSize': [5, 'hour'],
  //     'timeformat': '%I %p'
  //   }
  // },
  'oneDay': {
    'displayName': 'A day',
    'interval': 'hour',
    'flotOptions': {
      'tickSize': [2, 'hour'],
      'timeformat': '%I %p',
      yaxis: {
        yAxisValueType: '',
        axisLabel: ''
      }
    },
    'flotOptions_smallResolution': {
      'tickSize': [3, 'hour'],
      'timeformat': '%I %p'
    }
  },
  // 'twelveHours': {
  //   'displayName': '12 hours',
  //   'interval': 'hour',
  //   'flotOptions': {
  //     'tickSize': [1, 'hour'],
  //     'timeformat': '%I %p',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  // 'sixHours': {
  //   'displayName': '6 hours',
  //   'interval': 'hour',
  //   'flotOptions': {
  //     'tickSize': [1, 'hour'],
  //     'timeformat': '%I %p',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  // 'threeHours': {
  //   'displayName': '3 hours',
  //   'interval': 'hour',
  //   'flotOptions': {
  //     'tickSize': [1, 'hour'],
  //     'timeformat': '%I %p',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // },
  // 'oneHour': {
  //   'displayName': '60 mins',
  //   'interval': 'five_minutes',
  //   'flotOptions': {
  //     'tickSize': [10, 'minute'],
  //     'timeformat': '%I:%M %p',
  //     yaxis: {
  //       yAxisValueType: '',
  //       axisLabel: ''
  //     }
  //   }
  // }
}
