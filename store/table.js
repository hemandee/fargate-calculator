export const state = () => ({
  fargateTable: [],
  spotTable: []
})

export const mutations = {
  add(state, input) {
    // Round to 2 decimal places = Math.round( ( num + Number.EPSILON ) * 100 ) / 100
    if (input.memory > 0 && input.vcpu > 0 && input.region !== 'null') {
      state.fargateTable.push({
        memory: input.memory,
        vcpu: input.vcpu,
        region: input.region,
        tasks: input.tasks || 'Error',
        hourly: input.hourly || 'Error',
        daily: input.daily || 'Error',
        weekly: input.weekly || 'Error',
        monthly: input.monthly || 'Error',
        yearly: input.yearly || 'Error',
        actions: '',
        uuid: new Date().getUTCMilliseconds()
      })
    } else {
      // eslint-disable-next-line no-console
      console.log('Error Unable to add row to table', input)
    }
  },
  remove(state, item) {
    state.fargateTable.splice(state.fargateTable.indexOf(item), 1)
  },
  reset(state) {
    state.fargateTable = []
  },
  addSpot(state, input) {
    // Round to 2 decimal places = Math.round( ( num + Number.EPSILON ) * 100 ) / 100
    if (input.memory > 0 && input.vcpu > 0 && input.region !== 'null') {
      state.spotTable.push({
        memory: input.memory,
        vcpu: input.vcpu,
        region: input.region,
        tasks: input.tasks || 'Error',
        hourly: input.hourly || 'Error',
        daily: input.daily || 'Error',
        weekly: input.weekly || 'Error',
        monthly: input.monthly || 'Error',
        yearly: input.yearly || 'Error',
        actions: '',
        uuid: new Date().getUTCMilliseconds()
      })
    } else {
      // eslint-disable-next-line no-console
      console.log('Error Unable to add row to table', input)
    }
  },
  removeSpot(state, item) {
    state.spotTable.splice(state.spotTable.indexOf(item), 1)
  },
  resetSpot(state) {
    state.spotTable = []
  }
}

export const actions = {
  actionAddRow(context, input) {
    context.commit('add', input)
  },
  actionDeleteItem(context, input) {
    context.commit('remove', input)
  },
  actionReset(context) {
    context.commit('reset')
  },
  actionAddRowSpot(context, input) {
    context.commit('addSpot', input)
  },
  actionDeleteItemSpot(context, input) {
    context.commit('removeSpot', input)
  },
  actionResetSpot(context) {
    context.commit('resetSpot')
  }
}
