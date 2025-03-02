const getComponentProps = (question, currentItem) => {
  const typeSpecificProps = {
    VCheckbox: {
      trueValue: currentItem.value,
      label: currentItem.title,
      options: question.options,
    },

    VueSelect: {
      searchable: true,
      clearable: false,
      placeholder: currentItem.title,
      getOptionLabel: (e) => (e?.label ? e.label : e.value),
      options: currentItem.options,
      class: question?.class || '',
    },

    SelectInput: {
      placeholder: question.title,
    },

    VCard: {
      title: currentItem.title,
      img: currentItem.img,
      size: currentItem.size,
    },
  };

  return {
    ...(typeSpecificProps[question.component] || {}),
  };
};

export default getComponentProps;
